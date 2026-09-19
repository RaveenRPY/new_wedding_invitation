export const invitation = {
  guestName: 'Hubby',
  greeting: 'Cordially Invites',
  tagline: 'to celebrate with our family',
  groomFirst: 'Dilesh',
  brideFirst: 'Sayuri',
  groomFull: 'Dilesh Thabrew',
  brideFull: 'Sayuri Silva',
  groomParents: {
    label: 'Mr. & Mrs.',
    names: ['Kapila Thabrew', 'Chithra De Zoysa'],
  },
  brideParents: {
    label: 'Mr. & Mrs.',
    names: ['Ravindra Silva', 'Rohini Silva'],
  },
  groomRelation: 'Groom',
  brideRelation: 'Bride',
  announcement: 'WE JOYFULLY ANNOUNCE\nTHE WEDDING OF OUR CHILDREN',
  weddingDate: new Date('2026-11-02T09:00:00+05:30'),
  dayLabel: 'MONDAY',
  timeLabel: '9:00 AM',
  dayNumber: '02',
  monthLabel: 'NOVEMBER',
  yearLabel: '2026',
  venue: 'The Grand  Navro Hotel Matara',
  schedule: [
    { time: '9:00 AM', title: 'Welcome', icon: '/assets/church.webp', iconClass: 'h-[47px] w-[46px]' },
    { time: '11:24 AM', title: 'Poruwa ceremony', icon: '/assets/cake.webp', iconClass: 'h-[50px] w-[33px]' },
    { time: '12:30 PM', title: 'Reception & Lunch', icon: '/assets/cook.webp', iconClass: 'h-[29px] w-[44px]' },
    { time: '4:00 PM', title: 'Farewell', icon: null, iconClass: '' },
  ],
  photos: {
    couple1: '/uploads/couple1.jpg',
    couple2: '/uploads/couple2.jpg',
  },
  gallery: [
    { src: '/uploads/couple1.jpg', caption: 'Where our story began' },
    { src: '/uploads/couple2.jpg', caption: 'A promise of forever' },
    { src: '/uploads/couple3.jpg', caption: 'Golden hour with you' },
    { src: '/uploads/couple4.jpg', caption: 'Side by side' },
    { src: '/uploads/couple5.jpg', caption: 'Soft smiles' },
    { src: '/uploads/couple6.jpg', caption: 'By the water' },
  ],
  music: '/music/beautiful-in-white.mp3',
  calendarUrl:
    "https://www.google.com/calendar/render?action=TEMPLATE&text=%20Dilesh%20Thabrew%20%26%20Sayuri%20Silva's%20Wedding&dates=20261102T033000Z/20261102T053000Z&ctz=Asia/Colombo&details=Join%20us%20to%20celebrate%20the%20wedding%20of%20%20Dilesh%20Thabrew%20%26%20Sayuri%20Silva%20at%20The%20Grand%20%20Navro%20Hotel%20Matara&location=The%20Grand%20%20Navro%20Hotel%20Matara",
  directionsUrl:
    'https://www.google.com/maps/dir/?api=1&destination=The%20Grand%20%20Navro%20Hotel%20Matara',
  mapEmbedUrl:
    'https://maps.google.com/maps?q=The%20Grand%20Navro%20Hotel%20Matara&t=&z=15&ie=UTF8&iwloc=&output=embed',
  colors: {
    navy: '#00224c',
    cream: '#ece4d8',
    paper: '#f7f5ee',
    soft: '#ded9d7',
  },
} as const

export type Wish = {
  id: string
  name: string
  message: string
  createdAt: number
}
