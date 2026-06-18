import { HeroBlock, HeroBlockData } from "./blocks/HeroBlock"
import { FeaturesBlock, FeaturesBlockData } from "./blocks/FeaturesBlock"
import { CtaBlock, CtaBlockData } from "./blocks/CtaBlock"
import { FaqBlock, FaqBlockData } from "./blocks/FaqBlock"
import { PricingBlock, PricingBlockData } from "./blocks/PricingBlock"
import { TestimonialsBlock, TestimonialsBlockData } from "./blocks/TestimonialsBlock"
import { GalleryBlock, GalleryBlockData } from "./blocks/GalleryBlock"
import { StatsBlock, StatsBlockData } from "./blocks/StatsBlock"
import { ContentBlock, ContentBlockData } from "./blocks/ContentBlock"

export interface Block {
  blockType: string
  [key: string]: any
}

export function BlockRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.blockType) {
          case "hero":
            return <HeroBlock key={i} data={block as unknown as HeroBlockData} />
          case "features":
            return <FeaturesBlock key={i} data={block as unknown as FeaturesBlockData} />
          case "cta":
            return <CtaBlock key={i} data={block as unknown as CtaBlockData} />
          case "faq":
            return <FaqBlock key={i} data={block as unknown as FaqBlockData} />
          case "pricing":
            return <PricingBlock key={i} data={block as unknown as PricingBlockData} />
          case "testimonials":
            return <TestimonialsBlock key={i} data={block as unknown as TestimonialsBlockData} />
          case "gallery":
            return <GalleryBlock key={i} data={block as unknown as GalleryBlockData} />
          case "stats":
            return <StatsBlock key={i} data={block as unknown as StatsBlockData} />
          case "content":
            return <ContentBlock key={i} data={block as unknown as ContentBlockData} />
          default:
            console.warn(`Unknown block type: ${block.blockType}`)
            return null
        }
      })}
    </>
  )
}
