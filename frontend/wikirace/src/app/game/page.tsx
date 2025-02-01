'use client'
import { useState, useEffect } from 'react'

interface Player {
  name: string
  currentArticle: string
  clicks: number
}

export default function Game() {
  const [startArticle, setStartArticle] = useState('Coffee')
  const [targetArticle, setTargetArticle] = useState('Moon')
  const [currentArticle, setCurrentArticle] = useState(startArticle)
  const [clicks, setClicks] = useState(0)
  const [players, setPlayers] = useState<Player[]>([])
  const [gameStatus, setGameStatus] = useState<'waiting' | 'playing' | 'finished'>('waiting')

  // Simulated Wikipedia content - replace with actual Wikipedia API integration
  const [articleContent, setArticleContent] = useState<string>('')

  useEffect(() => {
    // TODO: Fetch actual Wikipedia content
    
    setArticleContent('This is a simulated Wikipedia article with <a href="#" data-article="Science">links</a>...')
  }, [currentArticle])

  const handleLinkClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    if (target.tagName === 'A') {
      e.preventDefault()
      const nextArticle = target.getAttribute('data-article')
      if (nextArticle) {
        setCurrentArticle(nextArticle)
        setClicks(clicks + 1)

        if (nextArticle === targetArticle) {
          setGameStatus('finished')
          // TODO: Handle win condition
        }
      }
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Game Info Panel */}
        <div className="md:col-span-1 bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Game Info</h2>
          <div className="space-y-2">
            <p><span className="font-semibold">Start:</span> {startArticle}</p>
            <p><span className="font-semibold">Target:</span> {targetArticle}</p>
            <p><span className="font-semibold">Clicks:</span> {clicks}</p>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Players</h3>
            <div className="space-y-2">
              {players.map((player, index) => (
                <div key={index} className="flex justify-between">
                  <span>{player.name}</span>
                  <span>{player.clicks} clicks</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wikipedia Article */}
        <div className="md:col-span-3 bg-white p-4 rounded-lg shadow">
          <h1 className="text-2xl font-bold mb-4">{currentArticle}</h1>
          <div 
            className="prose max-w-none"
            onClick={handleLinkClick}
            dangerouslySetInnerHTML={{ __html: articleContent }}
          />
        </div>
      </div>
    </div>
  )
}
