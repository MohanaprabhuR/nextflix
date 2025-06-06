import CategoryClient from "./page-client";

export default async function Home({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const [showsResponse, genresResponse] = await Promise.all([
    fetch(
      `${process.env.API_URL}/api/shows?populate=*&pagination[page]=1&pagination[pageSize]=1000`
    ),
    fetch(
      `${process.env.API_URL}/api/genres/${id}?populate=*&pagination[page]=1&pagination[pageSize]=1000`
    ),
  ]);

  if (!showsResponse.ok || !genresResponse.ok) {
    throw new Error("Failed to fetch data");
  }

  const [shows, genres] = await Promise.all([
    showsResponse.json(),
    genresResponse.json(),
  ]);

  return <CategoryClient initialData={{ shows, genres }} />;
}
