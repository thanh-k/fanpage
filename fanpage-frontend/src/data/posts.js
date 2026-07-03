const posts = [
  {
    id: 'p1',
    userId: 'u1',
    content:
      'Hôm nay mình thử sắp xếp lại góc học tập. Chỉ cần bàn gọn hơn một chút là tự nhiên thấy có động lực học hơn hẳn.',
    isAnonymous: false,
    images: [
      'https://picsum.photos/seed/fanpage-study-1/1200/700',
      'https://picsum.photos/seed/fanpage-study-2/1200/700'
    ],
    videos: [],
    likes: ['u2', 'u3'],
    createdAt: '2026-04-06T09:20:00.000Z'
  },
  {
    id: 'p2',
    userId: 'u2',
    content:
      'Có ai từng bị mất định hướng khi mới học React không? Mình đang cố gắng chia nhỏ component để dễ quản lý hơn.',
    isAnonymous: true,
    images: [],
    videos: [],
    likes: ['u1'],
    createdAt: '2026-04-06T13:45:00.000Z'
  },
  {
    id: 'p3',
    userId: 'u3',
    content:
      'Mình vừa hoàn thành một mini project frontend. Dù còn đơn giản nhưng cảm giác tự tay ghép thành sản phẩm chạy được rất vui.',
    isAnonymous: false,
    images: ['https://picsum.photos/seed/fanpage-project/1200/720'],
    videos: [],
    likes: ['u1', 'u2', 'u4'],
    createdAt: '2026-04-05T19:10:00.000Z'
  },
  {
    id: 'p4',
    userId: 'u4',
    content:
      'Đôi khi đăng ẩn danh lại dễ chia sẻ hơn. Miễn là mọi người vẫn giữ sự tôn trọng với nhau.',
    isAnonymous: true,
    images: ['https://picsum.photos/seed/fanpage-anonymous/1200/700'],
    videos: [],
    likes: ['u2'],
    createdAt: '2026-04-05T08:05:00.000Z'
  },
  {
    id: 'p5',
    userId: 'u2',
    content:
      'Thử áp dụng cơ chế tải theo trang giống news feed để fanpage nhẹ hơn. Khi cần mới tải thêm bài viết và ảnh lazy load.',
    isAnonymous: false,
    images: ['https://picsum.photos/seed/fanpage-feed/1200/680'],
    videos: [],
    likes: ['u1', 'u3'],
    createdAt: '2026-04-04T17:25:00.000Z'
  },
  {
    id: 'p6',
    userId: 'u1',
    content: 'Một chút video ngắn để bài viết sinh động hơn. Từ giờ có thể đăng cả ảnh lẫn video trong cùng một bài.',
    isAnonymous: false,
    images: ['https://picsum.photos/seed/fanpage-video-cover/1200/680'],
    videos: ['https://www.w3schools.com/html/mov_bbb.mp4'],
    likes: ['u2'],
    createdAt: '2026-04-04T08:40:00.000Z'
  },
  {
    id: 'p7',
    userId: 'u3',
    content: 'Mình thích kiểu giao diện sáng, dễ nhìn và nhiều khoảng thở. Dùng lâu sẽ đỡ mỏi mắt hơn giao diện nặng màu.',
    isAnonymous: false,
    images: ['https://picsum.photos/seed/fanpage-soft-ui/1200/720'],
    videos: [],
    likes: ['u1', 'u4'],
    createdAt: '2026-04-03T14:15:00.000Z'
  },
  {
    id: 'p8',
    userId: 'u4',
    content: 'Feed bây giờ tự tải thêm khi cuộn gần cuối nhìn mượt hơn nhiều. Không cần bấm tải thêm thủ công nữa.',
    isAnonymous: false,
    images: [],
    videos: [],
    likes: ['u1'],
    createdAt: '2026-04-03T09:30:00.000Z'
  },
  {
    id: 'p9',
    userId: 'u2',
    content: 'Có hôm chỉ muốn chia sẻ vài tấm ảnh chill thôi. Bài viết ngắn nhưng vẫn đủ cảm xúc.',
    isAnonymous: false,
    images: [
      'https://picsum.photos/seed/fanpage-chill-1/1200/760',
      'https://picsum.photos/seed/fanpage-chill-2/1200/760',
      'https://picsum.photos/seed/fanpage-chill-3/1200/760'
    ],
    videos: [],
    likes: ['u3'],
    createdAt: '2026-04-02T18:00:00.000Z'
  },
  {
    id: 'p10',
    userId: 'u1',
    content: 'Thêm một bài nữa để đủ dữ liệu demo cho tính năng auto load khi lướt gần hết 8 bài đầu tiên.',
    isAnonymous: true,
    images: ['https://picsum.photos/seed/fanpage-autoload/1200/700'],
    videos: [],
    likes: ['u2', 'u3', 'u4'],
    createdAt: '2026-04-02T08:10:00.000Z'
  }
];

export default posts;
