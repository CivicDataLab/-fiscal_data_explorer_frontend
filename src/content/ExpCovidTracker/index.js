import React from "react"

import Card from "../../components/molecules/FDidYouKnowCard"

import CoverImg from '../../imgs/cover_img.svg';


const ExpCovidTracker = () => {

  return (
    <div className='f-content f-home'>
      {/* <FPageMeta pageId = 'home' /> */}
      <div className='f-home__section f-home__cover'>
        <img className='f-home__cover-bg-img' src={CoverImg} alt="_blank"/>
        <div className='bx--row'>
          <div className='f-home__cover-text-wrapper bx--offset-lg-6 bx--col-lg-6'>
            <h1 className='f-cover-title'>COVID-19 Expenditure Tracker</h1>
            <h4 className='f-cover-subtitle'>The Covid-19 expenditure tracker is an exclusive addition to this tool where citizens can explore the spending that has occurred in Himachal Pradesh during the COVID-19 Epidemic.  </h4>
          </div>
        </div>
      </div>
      <div className='f-home__section'>
        <Card />
      </div>
    </div>
  )
}

export default ExpCovidTracker