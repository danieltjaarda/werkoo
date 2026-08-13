const cijfers = [
  { getal: "650+", tekst: "vakmensen aangesloten" },
  { getal: "9,4", tekst: "gemiddelde beoordeling" },
  { getal: "18 u", tekst: "gemiddelde reactietijd" },
  { getal: "0 €", tekst: "kosten voor je aanvraag" },
];

export function CijferBalk() {
  return (
    <div className="bg-ink py-8 text-white">
      <div className="container-page grid grid-cols-2 gap-6 sm:grid-cols-4">
        {cijfers.map((cijfer) => (
          <div key={cijfer.tekst} className="border-l-2 border-turquoise pl-4">
            <p className="font-display text-h3 leading-none">{cijfer.getal}</p>
            <p className="mt-1.5 text-klein text-white/65">{cijfer.tekst}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
