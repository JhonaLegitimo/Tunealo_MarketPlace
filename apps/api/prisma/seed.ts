// prisma/seed.ts
import { PrismaClient, Role, OrderStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();

  console.log('✨ Database cleared');

  // Create Tags/Categories
  const musicCategories = [
    'Beats', 'Vocals', 'Mixing', 'Mastering', 'Production',
    'Sound Design', 'Loops', 'Samples', 'Instruments', 'Effects'
  ];

  const tags = await Promise.all(
    musicCategories.map(name =>
      prisma.tag.create({ data: { name } })
    )
  );

  console.log(`✅ Created ${tags.length} tags`);

  // Create Users
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  // Admin user
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@tunealo.com',
      password: hashedPassword,
      avatar: faker.image.avatar(),
      role: Role.ADMIN,
    },
  });

  // Sellers
  const sellers = await Promise.all(
    Array.from({ length: 10 }).map(() =>
      prisma.user.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email(),
          password: hashedPassword,
          avatar: faker.image.avatar(),
          role: Role.SELLER,
        },
      })
    )
  );

  // Buyers
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

  // Create Products
  const products = await Promise.all(
    Array.from({ length: 50 }).map(async (_, index) => {
      const title = faker.helpers.arrayElement([
        `${faker.music.genre()} Beat Pack`,
        `Professional ${faker.music.genre()} Mix`,
        `${faker.word.adjective()} Vocal Sample`,
        `${faker.commerce.productAdjective()} Sound Design Kit`,
        `Premium ${faker.music.genre()} Loops`,
        `Mastering Service - ${faker.word.adjective()}`,
        `Custom ${faker.music.genre()} Production`,
      ]);

      const slug = `${faker.helpers.slugify(title).toLowerCase()}-${index}-${faker.string.alphanumeric(4)}`;

      const product = await prisma.product.create({
        data: {
          title,
          slug,
          description: faker.lorem.paragraphs(2),
          price: parseFloat(faker.commerce.price({ min: 9.99, max: 299.99 })),
          stock: faker.number.int({ min: 0, max: 100 }),
          published: faker.datatype.boolean(0.9), // 90% published
          sellerId: faker.helpers.arrayElement(sellers).id,
          categories: {
            connect: faker.helpers.arrayElements(tags, { min: 1, max: 3 }).map(tag => ({ id: tag.id }))
          },
        },
      });

      // Add 2-5 images per product
      const imageCount = faker.number.int({ min: 2, max: 5 });
      await Promise.all(
        Array.from({ length: imageCount }).map(() =>
          prisma.productImage.create({
            data: {
              url: faker.image.url(),
              productId: product.id,
            },
          })
        )
      );

      return product;
    })
  );

  console.log(`✅ Created ${products.length} products with images`);

  // Create Orders
  const orders = await Promise.all(
    Array.from({ length: 30 }).map(async () => {
      const buyer = faker.helpers.arrayElement(buyers);
      const orderProducts = faker.helpers.arrayElements(products, { min: 1, max: 4 });
      
      const items = orderProducts.map(product => {
        const quantity = faker.number.int({ min: 1, max: 3 });
        const commission = 0.15; // 15% commission
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

  // Create Reviews
  const completedOrders = orders.filter(o => o.status === OrderStatus.COMPLETED);
  
  const reviews = await Promise.all(
    completedOrders.flatMap(async order => {
      const orderWithItems = await prisma.order.findUnique({
        where: { id: order.id },
        include: { items: true },
      });

      // Some buyers review some products from their completed orders
      const itemsToReview = faker.helpers.arrayElements(
        orderWithItems!.items,
        { min: 1, max: orderWithItems!.items.length }
      );

      return Promise.all(
        itemsToReview.map(item =>
          prisma.review.create({
            data: {
              content: faker.lorem.paragraph(),
              rating: faker.number.int({ min: 3, max: 5 }), // Mostly positive reviews
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
  console.log('   Email: admin@tunealo.com');
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