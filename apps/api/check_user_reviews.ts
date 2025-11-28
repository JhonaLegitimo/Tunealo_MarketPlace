import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const userId = 30; // putica2
    console.log(`Checking reviews for user ${userId}...`);

    const reviews = await prisma.review.findMany({
        where: { authorId: userId },
        include: { product: true }
    });

    console.log(`Found ${reviews.length} reviews for user ${userId}:`);
    reviews.forEach(r => {
        console.log(`Review ID: ${r.id} | Product ID: ${r.productId} (${r.product.title}) | Rating: ${r.rating} | Content: "${r.content}"`);
    });

    // Also check orders for this user
    const orders = await prisma.order.findMany({
        where: { buyerId: userId },
        include: { items: { include: { product: true } } }
    });

    console.log(`\nFound ${orders.length} orders for user ${userId}:`);
    orders.forEach(o => {
        console.log(`Order ${o.id} (${o.status}):`);
        o.items.forEach(i => {
            console.log(`  - Product ${i.productId} (${i.product.title})`);
        });
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
