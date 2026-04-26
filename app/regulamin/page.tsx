export default function RegulaminPage() {
  return (
    <section className="w-full px-6 lg:px-12 pt-6 mt-12 mb-12">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        <h1 className="text-4xl lg:text-6xl font-bold text-(--primary)">
          Regulamin
        </h1>
        <p className="text-lg lg:text-xl font-medium text-(--neutral)">
          Regulamin strony internetowej {process.env.NEXT_PUBLIC_WEBSITE_NAME}
        </p>
      </div>
    </section>
  );
}