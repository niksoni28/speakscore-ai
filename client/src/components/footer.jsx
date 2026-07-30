import React from 'react'
import { BsRobot } from 'react-icons/bs'
import { FaLinkedin, FaGithub, FaEnvelope } from 'react-icons/fa'

const footer = () => {
  return (
        <div className='bg-[#f3f3f3] flex justify-center px-4 pb-10 py-4 pt-10'>
        <div className='w-full max-w-6xl bg-white rounded-[24px] shadow-sm
        border border-gray-200 py-8 px-3 text-center '>
        <div className='flex justify-center items-center gap-3 mb-3'>
        <div className='bg-black text-white p-2 rounded-lg'><BsRobot size={16}/></div>
        <h2 className='font-semibold'>SpeakScore.AI</h2>
        </div>
            <p className='text-gray-500 text-sm max-w-xl mx-auto'>
                AI-powered interview preparation platform designed to improve
                communication skills, technical depth and professional confidence.
            </p>
        <div className='flex justify-center gap-3 mt-5 mb-4'>
        <a href="https://www.linkedin.com/in/nikhil-soni-2b080228b/" target="_blank"
                    rel="noopener noreferrer"
                    className='w-9 h-9 rounded-full bg-white border border-gray-200
                    flex items-center justify-center text-emerald-600
                    hover:bg-emerald-50 hover:border-emerald-300 transition'>
                    <FaLinkedin size={16} />
                </a>
        <a href="https://github.com/niksoni28" target="_blank"
                    rel="noopener noreferrer"
                    className='w-9 h-9 rounded-full bg-white border border-gray-200
                    flex items-center justify-center text-emerald-600
                    hover:bg-emerald-50 hover:border-emerald-300 transition'>
                    <FaGithub size={16} />
                </a>
        <a href="mailto:niksoni.nks@gmail.com"
           className='w-9 h-9 rounded-full bg-white border border-gray-200
                    flex items-center justify-center text-emerald-600
           hover:bg-emerald-50 hover:border-emerald-300 transition'>
                    <FaEnvelope size={16} />
                </a>
        </div>

     <a href="https://nikportfolio-psi.vercel.app/" target="_blank"
      rel="noopener noreferrer"
     className='inline-block text-xs font-medium text-emerald-600
     bg-emerald-50 border border-emerald-200 px-4 py-1.5
     rounded-full hover:bg-emerald-100 transition mb-3'>
     Checkout my personal portfolio →
            </a>

    <p className='text-xs text-gray-500 border-t border-gray-200
                pt-3 mt-2 max-w-xs mx-auto'>
                Have a suggestion or feedback? I'd love to hear from you —
                reach out anytime.
            </p>
    </div>

    </div>
  )
}
export default footer
