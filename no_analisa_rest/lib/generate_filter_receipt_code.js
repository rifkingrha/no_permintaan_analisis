// Example Server Logic
async function generateReceiptCodes(payload) {
    const { filter_code } = payload;
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();

    // 1. Count existing records for this specific filter
    const count = await db('receipt_filter')
        .where('filter_code', filter_code)
        .count('id as total');
    
    const nextSeq = parseInt(count[0].total) + 1;

    // 2. Generate strings
    const receiptSeq = String(nextSeq).padStart(4, '0'); // 0010
    const uniqueSeq = String(nextSeq).padStart(3, '0');  // 010

    return {
        code: `${receiptSeq}/${filter_code}/${month}/${year}`,
        filter_code_no: `${filter_code}-${uniqueSeq}`
    };
}