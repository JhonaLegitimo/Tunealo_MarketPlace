// prisma/seed.ts
import { PrismaClient, Role, OrderStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { hash } from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed (Autopartes)...');

  // Clear existing data
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();

  console.log('✨ Database cleared');

  // 1. Crear Categorías de Autopartes
  const autoCategories = [
    'Motor', 'Frenos', 'Suspensión', 'Transmisión', 'Sistema Eléctrico',
    'Interior', 'Carrocería', 'Ruedas y Neumáticos', 'Aceites y Fluidos', 'Filtros',
    'Escape', 'Climatización'
  ];

  const tags = await Promise.all(
    autoCategories.map(name =>
      prisma.tag.create({ data: { name } })
    )
  );

  console.log(`✅ Created ${tags.length} tags (categories)`);

  // 2. Crear Usuarios (Igual que antes pero con datos genéricos)
  const hashedPassword = await hash('password123');

  // Admin user
  const admin = await prisma.user.create({
    data: {
      name: 'Admin Autopartes',
      email: 'admin@autopartes.com',
      password: hashedPassword,
      avatar: faker.image.avatar(),
      role: Role.ADMIN,
    },
  });

  // Sellers (Vendedores de repuestos)
  const sellers = await Promise.all(
    Array.from({ length: 10 }).map(() =>
      prisma.user.create({
        data: {
          name: faker.company.name(), // Nombre de empresa queda mejor para vendedores de partes
          email: faker.internet.email(),
          password: hashedPassword,
          avatar: faker.image.avatar(),
          role: Role.SELLER,
        },
      })
    )
  );

  // Buyers (Clientes con autos)
  const buyers = await Promise.all(
    Array.from({ length: 15 }).map(() =>
      prisma.user.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email(),
          password: hashedPassword,
          avatar: faker.image.avatar(),
          role: Role.BUYER,
        },
      })
    )
  );

  console.log(`✅ Created ${1 + sellers.length + buyers.length} users`);

  // Lista de partes comunes para generar títulos realistas
  const carPartsList = [
    'Pastillas de Freno Cerámicas', 'Disco de Freno Ventilado', 'Amortiguador Delantero',
    'Kit de Embrague', 'Alternador 12V', 'Motor de Arranque', 'Bomba de Agua',
    'Radiador de Aluminio', 'Filtro de Aceite Sintético', 'Batería de Alto Rendimiento',
    'Juego de Bujías Iridium', 'Correa de Distribución', 'Sensor de Oxígeno',
    'Faro Delantero LED', 'Espejo Retrovisor Eléctrico'
  ];

  // 3. Crear Productos (Autopartes)
  const products = await Promise.all(
    Array.from({ length: 50 }).map(async (_, index) => {
      // Generar un título tipo: "Bomba de Agua para Toyota Corolla 2015"
      const partName = faker.helpers.arrayElement(carPartsList);
      const vehicle = `${faker.vehicle.manufacturer()} ${faker.vehicle.model()}`;
      const year = faker.date.past({ years: 15 }).getFullYear();
      
      const title = `${partName} para ${vehicle} ${year}`;

      const slug = `${faker.helpers.slugify(title).toLowerCase()}-${index}-${faker.string.alphanumeric(4)}`;

      const product = await prisma.product.create({
        data: {
          title,
          slug,
          description: `Repuesto de alta calidad para ${vehicle}. ${faker.lorem.paragraphs(2)} Garantía de fábrica incluida.`,
          price: parseFloat(faker.commerce.price({ min: 15.00, max: 800.00 })), // Precios más realistas para partes
          stock: faker.number.int({ min: 0, max: 50 }),
          published: faker.datatype.boolean(0.9),
          sellerId: faker.helpers.arrayElement(sellers).id,
          categories: {
            connect: faker.helpers.arrayElements(tags, { min: 1, max: 2 }).map(tag => ({ id: tag.id }))
          },
        },
      });

      // Imágenes de autopartes (usando category transport o technics)
      const imageCount = faker.number.int({ min: 2, max: 4 });
      await Promise.all(
        Array.from({ length: imageCount }).map(() =>
          prisma.productImage.create({
            data: {
              // Usamos loremflickr directamente para asegurar imágenes de autos/piezas
              url: `https://loremflickr.com/640/480/transport,car,mechanic?lock=${faker.string.numeric(5)}`,
              productId: product.id,
            },
          })
        )
      );

      return product;
    })
  );

  console.log(`✅ Created ${products.length} auto parts with images`);

  // 4. Crear Órdenes
  const orders = await Promise.all(
    Array.from({ length: 30 }).map(async () => {
      const buyer = faker.helpers.arrayElement(buyers);
      const orderProducts = faker.helpers.arrayElements(products, { min: 1, max: 4 });
      
      const items = orderProducts.map(product => {
        const quantity = faker.number.int({ min: 1, max: 2 }); // Generalmente se compran 1 o 2 piezas
        const commission = 0.10; // 10% comisión por venta de partes
        const subtotal = product.price * quantity;
        const commissionAmount = subtotal * commission;
        
        return {
          productId: product.id,
          quantity,
          unitPrice: product.price,
          commission: commissionAmount,
          payout: subtotal - commissionAmount,
        };
      });

      const total = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

      return prisma.order.create({
        data: {
          buyerId: buyer.id,
          total,
          status: faker.helpers.arrayElement([
            OrderStatus.PENDING,
            OrderStatus.PAID,
            OrderStatus.SHIPPED,
            OrderStatus.COMPLETED,
            OrderStatus.CANCELLED,
          ]),
          items: {
            create: items,
          },
        },
      });
    })
  );

  console.log(`✅ Created ${orders.length} orders`);

  // 5. Crear Reseñas (Reviews)
  const completedOrders = orders.filter(o => o.status === OrderStatus.COMPLETED);
  
  const reviews = await Promise.all(
    completedOrders.flatMap(async order => {
      const orderWithItems = await prisma.order.findUnique({
        where: { id: order.id },
        include: { items: true },
      });

      const itemsToReview = faker.helpers.arrayElements(
        orderWithItems!.items,
        { min: 1, max: orderWithItems!.items.length }
      );

      return Promise.all(
        itemsToReview.map(item =>
          prisma.review.create({
            data: {
              content: faker.helpers.arrayElement([
                "Excelente repuesto, quedó perfecto en mi auto.",
                "Buena calidad, aunque el envío tardó un poco.",
                "Funciona como el original, muy recomendado.",
                "La pieza llegó bien embalada y en perfectas condiciones.",
                "Instalación sencilla, todo correcto."
              ]) + " " + faker.lorem.sentence(),
              rating: faker.number.int({ min: 3, max: 5 }),
              productId: item.productId,
              authorId: order.buyerId,
            },
          })
        )
      );
    })
  );

  console.log(`✅ Created ${reviews.flat().length} reviews`);

  console.log('🎉 Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   Users: ${1 + sellers.length + buyers.length}`);
  console.log(`   Tags: ${tags.length}`);
  console.log(`   Products: ${products.length}`);
  console.log(`   Orders: ${orders.length}`);
  console.log(`   Reviews: ${reviews.flat().length}`);
  console.log('\n🔑 Test credentials:');
  console.log('   Email: admin@autopartes.com');
  console.log('   Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });