import { connection } from "next/server";
import { CheckinForm } from "@/components/mood/checkin-form";

export default async function MoodPage() {
  await connection();

  return (
    <div className="w-full">
      <CheckinForm />
    </div>
  );
}
