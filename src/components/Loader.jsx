import React from 'react'

const Loader = () => {
  return (
    <div className="w-full h-screen flex justify-center items-center">
      <div className="circle-container">
          <div className="animated-circle one"></div>
          <div className="animated-circle two"></div>
          <div className="animated-circle three"></div>
      </div>
    </div>
  )
}

export default Loader
