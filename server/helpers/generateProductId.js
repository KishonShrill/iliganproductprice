import { Product } from '../models/models.js'; // adjust path

//! [ ] CHECK IF THIS WORKS
// Helper function to generate product_id (Year-Sequential Number)
// TODO: Test this first before using it to the database
async function generateProductId() {
    const currentYear = new Date().getFullYear().toString();
    // Find the latest product from the current year
    const lastProduct = await Product.findOne({
        product_id: new RegExp(`^${currentYear}-\\d{4}$`) // Regex to match the pattern
    }).sort({ product_id: -1 }); // Sort descending to get the latest

    let nextItemNumber = 1;
    if (lastProduct) {
        const lastProductId = lastProduct.product_id;
        const lastItemNumber = parseInt(lastProductId.split('-')[1], 10);
        nextItemNumber = lastItemNumber + 1;
    }

    // Format the item number with leading zeros (e.g., 0001, 0010, 0100)
    const formattedItemNumber = nextItemNumber.toString().padStart(4, '0');

    console.log(`Generated Item Number: ${currentYear}-${formattedItemNumber}`);
    return `${currentYear}-${formattedItemNumber}`;
}

export default generateProductId
