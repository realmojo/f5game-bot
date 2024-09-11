// api/cron-job.js
export default function handler(req, res) {
  // 실행하고 싶은 로직을 이곳에 추가합니다.
  console.log("Cron job is running!");
  res.status(200).json({ message: "Cron job executed successfully!" });
}
