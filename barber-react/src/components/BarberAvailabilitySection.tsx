type BarberStatus = 'available' | 'busy' | 'break'

interface Barber {
  id: number
  name: string
  role: string
  imageUrl: string
  status: BarberStatus
}

const barbers: Barber[] = [
  {
    id: 1,
    name: 'Andre Wijaya',
    role: 'Master Barber',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD3nNqhizkaPi6M2lJfKDItfXGT973LcOxg6UC4QegYjRzRH2HiqmZ3wZ7rTEyvBeE8QS6cLMqOIpqXOMXVRPbB-dbUwjS1-g3dh8p1DgXQ_H_ic1DxlZS4l1IrQSpSM70vapeU06K-y2Y3amZj4cF6ViIGMgqX-ktywmpcRycdXxmRFo33dDd5nXWqeIK58Yw1bABTlMZOLz4CLrTlu7CxpRNlbSV3vCGaEq9xHkVxcg6RsF8aoc5y8oXDRmZpxNV9VP0n66GA4dw',
    status: 'available',
  },
  {
    id: 2,
    name: 'Rendy Pratama',
    role: 'Artisan Specialist',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCUqU2k8WVTEB80jH8gNdw8GaCLtQ4vnkdIgHkVHAB80aaQtUNnhBXf0WEF-bMqOb5uPbBmSQZR7JtWw5z-JxGtyl-BnSiIhWMI0KBq5R0n5WBEJYcvrj5E2NJz5bPN65KbMwHGzTZttl8b9e7Bg_VOwcWozqRneptUm8R9VcmltVCAv-cOPxSlsWTp_g66iea6_BWWXyoR2JZBVqImZdnijQrsckkZ9Ex9d0jIg3SDX9f_vkphDiAc-nizkX-9qsmyqXOF0S8C7Z4',
    status: 'busy',
  },
  {
    id: 3,
    name: 'Dimas Surya',
    role: 'Senior Stylist',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBt0cC403-ASZvFS5cuR-fhU3N8kuujlpb72O5l8mHNOvMAaFdevvrISWiGKHfjNdRqkhj7qRrs6gLeECe7tJJG4dvUnMzrtAw2V7aygaoifx_XUMi1qexZlwNxGab7ZrqYW3_tB5VOnWelIGsqhfNnXJrTYyTUMm8Tqt1vPaVmfAeosGcXZDQ2K-fsQLhkH6b-HEARvfKKx5Zz7DYLtPj2zZ41l5nmHCxDshq1DakTWuI65sJIsnyz3C7sK_PiYPe7kMgcHmRmA4Y',
    status: 'break',
  },
  {
    id: 4,
    name: 'Fajar Siddiq',
    role: 'Grooming Expert',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAIoBAJASQPNQ3g1rzQrFrPfSp-5Sb_36aCYIE4pdNd9Y4j4isv5DqPhf2lgvGuQtaYNvfhD9nwx_RW3sC2nqAhcxakPwgxg0LDvzcyXpst762G8NNIcwU0TGUX8VUXedJCCNuDAgbCneHIPRA0DM_v5WyDghnQS6GZkqF6uprNTYCnvbiqWVGMM91rkUgmkzPMo2OjgjRQbHyUvUD7xGTOtJOn_RHkdX-5mbshReAAPWpizUPFevuHHpgqPxWcJdWQMpp2gLuK-K0',
    status: 'available',
  },
]

const statusConfig: Record<BarberStatus, { dotColor: string; badgeClass: string; label: string }> = {
  available: {
    dotColor: 'bg-green-500',
    badgeClass: 'bg-green-500/10 text-green-500',
    label: 'Available',
  },
  busy: {
    dotColor: 'bg-red-500',
    badgeClass: 'bg-red-500/10 text-red-500',
    label: 'Busy',
  },
  break: {
    dotColor: 'bg-yellow-500',
    badgeClass: 'bg-yellow-500/10 text-yellow-500',
    label: 'On Break',
  },
}

const BarberCard = ({ barber }: { barber: Barber }) => {
  const config = statusConfig[barber.status]
  return (
    <div className="bg-surface-container p-6 rounded-lg border border-outline-variant/10 flex flex-col items-center text-center group hover:border-primary/30 transition-colors">
      <div className="relative mb-6">
        <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-primary/20 p-1">
          <img
            alt={barber.name}
            className="w-full h-full object-cover rounded-full grayscale group-hover:grayscale-0 transition-all duration-500"
            src={barber.imageUrl}
          />
        </div>
        <div
          className={`absolute bottom-1 right-1 w-6 h-6 ${config.dotColor} border-4 border-surface-container rounded-full`}
          title={config.label}
        ></div>
      </div>
      <h3 className="font-headline text-xl font-bold mb-1">{barber.name}</h3>
      <p className="text-secondary text-sm mb-4 font-label">{barber.role}</p>
      <span
        className={`${config.badgeClass} px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest`}
      >
        {config.label}
      </span>
    </div>
  )
}

const BarberAvailabilitySection = () => {
  return (
    <section className="py-24 bg-surface-container-lowest border-y border-outline-variant/10">
      <div className="container mx-auto px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-primary font-label uppercase tracking-widest text-sm mb-4 block">
            Status Antrean
          </span>
          <h2 className="font-headline text-4xl font-bold mb-4">Ketersediaan Kapster</h2>
          <div className="h-1 w-16 bg-primary mx-auto mb-6"></div>
          <p className="text-secondary max-w-2xl mx-auto">
            Pantau ketersediaan seniman rambut kami secara real-time untuk kunjungan yang lebih
            terencana.
          </p>
        </div>

        {/* Barber Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {barbers.map((barber) => (
            <BarberCard key={barber.id} barber={barber} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default BarberAvailabilitySection
