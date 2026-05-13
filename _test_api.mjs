const res = await fetch("http://localhost:3000/api/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    type: "text",
    text: "AI is transforming how indie developers build and ship products. With tools like Cursor and Claude, a solo developer can now build a full SaaS product in weeks instead of months. The key is to focus on a narrow painful problem and solve it well rather than trying to build a massive platform. Distribution matters more than features — building in public on Twitter and launching on Product Hunt can get you your first 100 users."
  })
});
const data = await res.json();
console.log("Status:", res.status);
if (data.platforms) {
  for (const p of data.platforms) {
    console.log(`\n=== ${p.platform.toUpperCase()} ===`);
    console.log(p.content.slice(0, 300));
    console.log("Tips:", p.tips);
  }
} else {
  console.log(JSON.stringify(data, null, 2));
}
