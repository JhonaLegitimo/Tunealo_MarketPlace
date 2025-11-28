import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Listing all reviews in DB...');

    const reviews = await prisma.review.findMany({
        include: { author: true, product: true },
        orderBy: { createdAt: 'desc' }
    });

    console.log(`Found ${reviews.length} total reviews.`);

    reviews.forEach(r => {
        console.log(`Review ${r.id}: Product ${r.productId} (${r.product.title}) - Author ${r.authorId} (${r.author.name}) - Rating ${r.rating} - Content: ${r.content.substring(0, 20)}...`);
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
