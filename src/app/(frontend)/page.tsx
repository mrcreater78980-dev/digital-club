import { HomeView } from '@/components/club/home'
import { getClubContent } from '@/lib/club-content'
export default async function HomePage() {
  return <HomeView content={await getClubContent()} />
}
