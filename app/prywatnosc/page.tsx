export default function PolitykaPrywatnosci() {



  return (
    <section className="w-full px-6 lg:px-12 pt-6 mt-36">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        <h1 className="text-4xl lg:text-6xl font-bold text-(--primary)">
          Polityka Prywatności
        </h1>
        <p className="text-lg lg:text-xl font-medium text-(--neutral)">
          Polityka prywatności strony internetowej {process.env.NEXT_PUBLIC_WEBSITE_NAME} 
        </p>
        <p className="text-lg lg:text-xl font-medium text-(--neutral)">
          Data publikacji: 26.04.2026
        </p>

        <section>
          <h2 className="text-2xl lg:text-3xl font-bold text-(--primary)">
            1. Definicje
          </h2>
          <p className="text-lg lg:text-xl font-medium text-(--neutral)">
             ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quod.
          </p>
        </section>
        <section>
          <h2 className="text-2xl lg:text-3xl font-bold text-(--primary)">
            2. Definicje
          </h2>
          <p className="text-lg lg:text-xl font-medium text-(--neutral)">
             ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quod.
          </p>
        </section>
        <section>
          <h2 className="text-2xl lg:text-3xl font-bold text-(--primary)">
            3. Definicje
          </h2>
          <p className="text-lg lg:text-xl font-medium text-(--neutral)">
             ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quod.
          </p>
        </section>
      </div>
    </section>
  );
}