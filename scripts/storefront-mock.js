const http = require('http')
const fs = require('fs')
const path = require('path')

const PORT = Number(process.env.PORT || 5501)
const SAMPLES_DIR = path.join(__dirname, '..', 'public', 'storefront-samples')
const SAMPLE_BASE =
  process.env.SAMPLE_BASE || `http://127.0.0.1:${PORT}/samples`

function sample(relativePath) {
  return `${SAMPLE_BASE}/${relativePath}`
}

const storefrontSeeds = [
  ['Premium Gifts Co.', 'premium-gifts-co', 'Handcrafted premium gifts for every occasion, wrapped with care.', 'Premium Gifts Co.', 'premium'],
  ['Lagos Leather Studio', 'lagos-leather-studio', 'Minimal leather goods made by hand in Lagos.', 'Lagos Leather Studio', 'leather'],
  ['Bloom & Petal', 'bloom-and-petal', 'Fresh flowers, preserved bouquets, and thoughtful gift sets.', 'Bloom & Petal', 'flowers'],
  ['The Candle Room', 'the-candle-room', 'Small-batch soy candles with calm, memorable scents.', 'The Candle Room', 'candles'],
  ['Tech Gift Lab', 'tech-gift-lab', 'Useful tech accessories for people who love good design.', 'Tech Gift Lab', 'tech'],
  ['Heritage Beads', 'heritage-beads', 'Contemporary jewellery inspired by Nigerian craft traditions.', 'Heritage Beads', 'beads'],
  ['Paper & Ink', 'paper-and-ink', 'Stationery, journals, and keepsakes for everyday notes.', 'Paper & Ink', 'paper'],
  ['The Hamper Edit', 'the-hamper-edit', 'Curated hampers for celebrations, thank-yous, and milestones.', 'The Hamper Edit', 'hamper'],
  ['Golden Hour', 'golden-hour', 'Warm, golden gifts for birthdays and anniversaries.', 'Golden Hour', 'golden'],
  ['Terra Home', 'terra-home', 'Hand-thrown ceramics and quiet home objects.', 'Terra Home', 'terra'],
  ['Little Luxuries', 'little-luxuries', 'Small treats that feel unexpectedly special.', 'Little Luxuries', 'luxuries'],
  ['The Gift Archive', 'the-gift-archive', 'Limited-edition gifts from independent makers.', 'The Gift Archive', 'archive'],
  ['North Star Goods', 'north-star-goods', 'Practical goods, beautifully made.', 'North Star Goods', 'northstar'],
  ['Scent Stories', 'scent-stories', 'Fragrance, bath, and body rituals.', 'Scent Stories', 'scent'],
  ['Weekend Market', 'weekend-market', 'A rotating market of local favourites.', 'Weekend Market', 'market'],
]

const storefronts = storefrontSeeds.map(([name, slug, description, businessName, bannerKey], index) => ({
  vendorId: `671641aa9f1b2c00123422${String(index).padStart(2, '0')}`,
  name,
  slug,
  description,
  displaySettings: {
    banner: sample(`banners/${bannerKey}.jpg`),
    theme: 'default',
    layout: index === 1 ? 'list' : 'grid',
  },
  publishedAt: new Date(Date.UTC(2026, 9, 24 - index, 10, 0, 0)).toISOString(),
  productCount: index === 0 ? 14 : 3 + (index % 4),
  vendor: {
    businessName,
    name: ['Ada', 'Tunde', 'Chiamaka', 'Bola', 'Emeka'][index % 5] + ' Okafor',
  },
}))

function makeProduct(index, slug) {
  const id = `671641bb9f1b2c00123433${String(index).padStart(2, '0')}`
  const names = [
    'Leather Wallet',
    'Signature Gift Box',
    'Scented Soy Candle',
    'Hand-thrown Mug',
    'Beaded Necklace Set',
    'Linen Journal',
    'Celebration Hamper',
    'Preserved Rose Bouquet',
    'Smartphone Accessory Kit',
    'Gold-tone Necklace',
    'Ceramic Planter',
    'Thank You Notebook Set',
    'Mini Fragrance Duo',
    'Silk Sleep Mask',
  ]
  const imageKeys = [
    'wallet',
    'gift-box',
    'candle',
    'mug',
    'beads',
    'journal',
    'hamper',
    'roses',
    'charger',
    'necklace',
    'planter',
    'cards',
    'gift-tag',
    'sleep-mask',
  ]
  const categories = [
    'accessories',
    'gifting',
    'home',
    'home',
    'jewellery',
    'stationery',
    'gifting',
    'gifting',
    'accessories',
    'jewellery',
    'home',
    'stationery',
    'gifting',
    'home',
  ]
  const name = names[index % names.length]
  const imageKey = imageKeys[index % imageKeys.length]
  const price = [45000, 12500, 28000, 18000, 32000][index % 5]
  const hasVariants = index % 5 === 1
  const free = index === 12

  return {
    id,
    name: free ? 'Free Sample Gift Tag' : name,
    description:
      index % 3 === 0
        ? 'A considered piece, made in small batches and finished by hand for a gift that lasts.'
        : 'Beautifully made and ready to gift, with careful packaging included.',
    category: categories[index % categories.length],
    price: free ? 0 : price,
    stock: index === 7 ? 0 : 8 + index,
    images: [sample(`products/${imageKey}.jpg`)],
    variants: hasVariants
      ? [
          { color: 'Natural', size: 'Standard', price: price + 2000, stock: 6, sku: `SKU-${index}-NAT`, images: [sample(`products/${imageKey}.jpg`)] },
          { color: 'Charcoal', size: 'Standard', price: price + 4000, stock: 3, sku: `SKU-${index}-CHR`, images: [sample(`products/${imageKey}.jpg`)] },
        ]
      : [],
    storefrontSlug: slug,
  }
}

const products = Array.from({ length: 14 }, (_, index) =>
  makeProduct(index, 'premium-gifts-co')
)

function json(res, status, payload) {
  const body = JSON.stringify(payload)
  res.writeHead(status, {
    'content-type': 'application/json',
    'content-length': Buffer.byteLength(body),
    'x-ratelimit-limit': '120',
    'x-ratelimit-remaining': '119',
  })
  res.end(body)
}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = ''
    req.on('data', (chunk) => (body += chunk))
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch {
        resolve({})
      }
    })
  })
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)
  const pathname = url.pathname

  if (req.method === 'GET' && pathname.startsWith('/samples/')) {
    const relative = decodeURIComponent(pathname.slice('/samples/'.length))
    const filePath = path.join(SAMPLES_DIR, relative)
    if (!filePath.startsWith(SAMPLES_DIR + path.sep)) {
      return json(res, 403, { success: false, message: 'Forbidden' })
    }
    return fs.readFile(filePath, (error, data) => {
      if (error) {
        json(res, 404, { success: false, message: 'Image not found' })
        return
      }
      const type =
        {
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png',
          '.webp': 'image/webp',
        }[path.extname(filePath).toLowerCase()] || 'application/octet-stream'
      res.writeHead(200, {
        'content-type': type,
        'content-length': data.length,
        'cache-control': 'no-store',
      })
      res.end(data)
    })
  }

  if (req.method === 'GET' && pathname === '/api/public/storefronts') {
    const page = Math.max(1, Number(url.searchParams.get('page')) || 1)
    const limit = Math.min(50, Math.max(1, Number(url.searchParams.get('limit')) || 20))
    const search = (url.searchParams.get('search') || '').toLowerCase()
    const sortBy = url.searchParams.get('sortBy') || 'publishedAt'
    const sortOrder = url.searchParams.get('sortOrder') || 'desc'

    let list = storefronts.filter(
      (item) =>
        !search ||
        item.name.toLowerCase().includes(search) ||
        item.slug.toLowerCase().includes(search) ||
        item.description.toLowerCase().includes(search)
    )

    list = list.sort((a, b) => {
      const direction = sortOrder === 'asc' ? 1 : -1
      if (sortBy === 'name') return a.name.localeCompare(b.name) * direction
      return (new Date(a.publishedAt) - new Date(b.publishedAt)) * direction
    })

    const total = list.length
    const pages = Math.max(1, Math.ceil(total / limit))
    const start = (page - 1) * limit
    return json(res, 200, {
      success: true,
      data: {
        message: 'Storefronts retrieved successfully',
        data: list.slice(start, start + limit),
        pagination: { page, limit, total, pages },
      },
    })
  }

  const detailMatch = pathname.match(/^\/api\/public\/storefronts\/([^/]+)$/)
  if (req.method === 'GET' && detailMatch) {
    const slug = decodeURIComponent(detailMatch[1])
    const storefront = storefronts.find((item) => item.slug === slug)
    if (!storefront) {
      return json(res, 404, {
        success: false,
        message: 'Storefront not found',
        code: 'NOT_FOUND',
      })
    }

    const page = Math.max(1, Number(url.searchParams.get('page')) || 1)
    const limit = Math.min(50, Math.max(1, Number(url.searchParams.get('limit')) || 20))
    const total = storefront.slug === 'premium-gifts-co' ? products.length : Math.min(storefront.productCount, 6)
    const all =
      storefront.slug === 'premium-gifts-co'
        ? products
        : Array.from({ length: total }, (_, index) => makeProduct(index, slug))
    const pages = Math.max(1, Math.ceil(total / limit))
    const start = (page - 1) * limit

    return json(res, 200, {
      success: true,
      data: {
        ...storefront,
        productCount: total,
        products: all.slice(start, start + limit),
        productsPagination: { page, limit, total, pages },
      },
    })
  }

  const orderMatch = pathname.match(/^\/api\/public\/storefronts\/([^/]+)\/orders$/)
  if (req.method === 'POST' && orderMatch) {
    const slug = decodeURIComponent(orderMatch[1])
    const storefront = storefronts.find((item) => item.slug === slug)
    if (!storefront) {
      return json(res, 404, {
        success: false,
        message: 'Storefront not found',
        code: 'NOT_FOUND',
      })
    }

    const body = await parseBody(req)
    if (!body.customer?.name || !body.customer?.email) {
      return json(res, 400, {
        success: false,
        message: 'Customer name and email are required.',
        code: 'VALIDATION_ERROR',
      })
    }
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return json(res, 400, {
        success: false,
        message: 'At least one item is required.',
        code: 'VALIDATION_ERROR',
      })
    }

    const totalAmount = body.items.reduce((total, item) => {
      const product = products.find((entry) => entry.id === item.productId)
      if (!product) return total
      if (item.variantSku && Array.isArray(product.variants)) {
        const variant = product.variants.find((entry) => entry.sku === item.variantSku)
        return total + (variant?.price ?? product.price) * item.quantity
      }
      return total + product.price * item.quantity
    }, 0)

    if (totalAmount === 0) {
      return json(res, 201, {
        success: true,
        data: {
          message: 'Order placed successfully.',
          orderReference: 'ORD-FREE-1234',
          storefrontName: storefront.name,
          totalAmount: 0,
          paymentStatus: 'completed',
          fulfillmentStatus: 'pending_fulfillment',
          paidAt: new Date().toISOString(),
        },
      })
    }

    return json(res, 201, {
      success: true,
      data: {
        message: 'Order created. Please complete payment.',
        orderReference: 'ORD-PAID-5678',
        storefrontName: storefront.name,
        totalAmount,
        paymentUrl: 'https://checkout.paystack.com/mock',
        accessCode: 'mock-access-code',
        reference: 'mock-paystack-reference',
        paymentStatus: 'pending',
        fulfillmentStatus: 'awaiting_payment',
      },
    })
  }

  json(res, 404, { success: false, message: 'Not found', code: 'NOT_FOUND' })
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Mock storefront API listening on http://127.0.0.1:${PORT}`)
})
