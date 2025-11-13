import './App.css'
import { Hero } from './components/Hero/Hero'
import { SectionEight } from './components/SectionEight/sectionEight'
import { SectionFive } from './components/SectionFive/sectionFive'
import { SectionFour } from './components/SectionFour/sectionFour'
import { SectionNine } from './components/SectionNine/sectionNine'
import { SectionSeven } from './components/SectionSeven/sectionSeven'
import { SectionSix } from './components/SectionSix/sectionSix'
import { SectionTreee } from './components/SectionTree/sectionThree'
import { SectionTwo } from './components/SectionTwo/Sectiontwo'
import { WhatsAppButton } from './components/WhatsAppButton/Whatsappbutton'




function App() {
  return (
    <>
      <Hero />
      <SectionTwo/>
      <SectionTreee/>
      <SectionFour/>
      <SectionFive/>
      <SectionSix/>
      <SectionSeven/>
      <SectionEight/>
      <SectionNine/>
      <WhatsAppButton />
    </>
  )
}

export default App

