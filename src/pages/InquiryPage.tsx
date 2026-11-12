import { useLocation } from 'react-router-dom';
import Container from '../components/ui/Container';
import ContactForm from '../components/ui/ContactForm';
import { parseBookingContext } from '../data/booking';

const publicSlugs = Object.values(import.meta.glob<string>('../../content/articles/*.json', { eager: true, import: 'slug' }));

function inquirySource(search: string) {
  const context = parseBookingContext(search, publicSlugs);
  const params = new URLSearchParams();
  if (context.service) params.set('service', context.service);
  if (context.priority) params.set('priority', context.priority);
  if (context.source) params.set('source', context.source);
  const query = params.toString();
  return query ? `/inquire/?${query}` : '/inquire/';
}

export default function InquiryPage() {
  const { search } = useLocation();
  const source = inquirySource(search);
  const context = parseBookingContext(search, publicSlugs);

  return (
    <main className="py-12 md:py-20">
      <Container>
        <div className="max-w-2xl mx-auto">
          <a href="/articles/" className="text-sm text-[var(--color-accent)]">← Explore the articles</a>
          <p className="mt-10 mb-3 text-xs uppercase tracking-widest text-[var(--color-accent)]">Start a conversation</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-5">Get started</h1>
          <p className="text-lg leading-relaxed text-[var(--color-text-muted)] mb-8">Tell us about your workflow or AI project. We'll get back to you personally.</p>
          {context.source && <a href={`/articles/${context.source}/`} className="block mb-6 text-sm text-[var(--color-accent)]">Return to the related article →</a>}
          <ContactForm source={source} cta="Inquiry contact form" />
        </div>
      </Container>
    </main>
  );
}
