import Footer from "../components/Footer"
import Header from "../components/Header"
import Section1 from "../components/Section1"
import Section2 from "../components/Section2"
import Section3 from "../components/Section3"

function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-10 pb-10">
        <Section1 />
        <Section3 />
        <Section2 />
      </main>
      <Footer />
    </div>
  );
}

export default HomePage;
