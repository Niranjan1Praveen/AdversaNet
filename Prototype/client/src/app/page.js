import Faqs from '@/sections/Faqs'
import Features from '@/sections/Features'
import Footer from '@/sections/Footer'
import Hero from '@/sections/Hero'
import Introduction from '@/sections/Introduction'
import Navbar from '@/sections/Navbar'
import Pricing from '@/sections/Pricing'


const Home = () => {
  return (
    // <main className='bg-gradient-to-bottom'>
    <main>
        <Navbar/>
        <Hero/>
        <Introduction/>
        <Features/>
        <Pricing/>
        <Faqs/>
        <Footer/>
    </main>
  )
}

export default Home;