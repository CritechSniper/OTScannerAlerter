export const a = [
  "naima.mp3",
  "najmal.mp3",
  "srivarshan.mp3"
]
const root = "/common files/audiotrack/"
export const enactBS = async (s) => {
  const audio = new Audio(`${root}${s}`)
  audio.play()
}