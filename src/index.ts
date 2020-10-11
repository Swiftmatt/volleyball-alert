

async function main(): Promise<void> {

}


(async () => {
    await main();
})().catch(err => {
    console.error(err);
    process.exit(1);
});
