import Image from "next/image";
import EventDetails from "@/components/EventDetails";
import RegistrationForm from "@/components/RegistrationForm";
import ScrollDownButton from "@/components/ScrollDownButton";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="lg:sticky lg:top-8 lg:self-start">
            <div className="overflow-hidden rounded-xl shadow-lg">
              <Image
                src="/PublicInvite.jpeg"
                alt="In Loving Memory of Dr. (Mrs.) Uwem Oyekan — Remembrance ceremony invitation"
                width={600}
                height={800}
                priority
                className="h-auto w-full"
              />
            </div>
            <EventDetails />
          </div>

          <div
            id="registration-form"
            className="rounded-2xl border-t-4 border-gold bg-card p-6 shadow-lg sm:p-8 lg:p-10"
          >
            <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
              Register for the Event
            </h2>
            <p className="mt-2 mb-6 text-muted">
              Please fill in your details to confirm your attendance.
            </p>
            <RegistrationForm />
          </div>
        </div>
      </div>
      <ScrollDownButton />
    </main>
  );
}
