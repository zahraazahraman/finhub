import Card from "../ui/Card.jsx";
import Button from "../ui/Button.jsx";

export default function WeeklySummaryCard({ onSend, sending, message }) {
  return (
    <Card padding="md" className="mt-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-skin-brand-subtle flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-brand" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-skin-text text-sm">Weekly Summary Email</h3>
            <p className="text-xs text-skin-text-secondary mt-0.5">
              Sends a snapshot of your bills and upcoming due dates to your email.
              You can send once every 7 days.
            </p>
            {message && (
              <p className={`text-xs mt-2 font-medium ${message.type === "success" ? "text-green-600" : "text-red-500"}`}>
                {message.type === "success" ? "✓ " : "✗ "}{message.text}
              </p>
            )}
          </div>
        </div>
        <Button variant="secondary" size="sm" loading={sending} onClick={onSend} className="shrink-0">
          Send Now
        </Button>
      </div>
    </Card>
  );
}