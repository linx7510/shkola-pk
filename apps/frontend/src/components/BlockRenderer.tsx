"use client"
import { HeroBlock, HeroBlockData } from "./blocks/HeroBlock"
import { FeaturesBlock, FeaturesBlockData } from "./blocks/FeaturesBlock"
import { CtaBlock, CtaBlockData } from "./blocks/CtaBlock"
import { FaqBlock, FaqBlockData } from "./blocks/FaqBlock"
import { PricingBlock, PricingBlockData } from "./blocks/PricingBlock"
import { TestimonialsBlock, TestimonialsBlockData } from "./blocks/TestimonialsBlock"
import { GalleryBlock, GalleryBlockData } from "./blocks/GalleryBlock"
import { StatsBlock, StatsBlockData } from "./blocks/StatsBlock"
import { ContentBlock, ContentBlockData } from "./blocks/ContentBlock"
import { TextBlock, TextBlockData } from "./blocks/TextBlock"
import { ImageBlock, ImageBlockData } from "./blocks/ImageBlock"
import { VideoBlock, VideoBlockData } from "./blocks/VideoBlock"
import { StepsBlock, StepsBlockData } from "./blocks/StepsBlock"
import { CardsBlock, CardsBlockData } from "./blocks/CardsBlock"
import { ContactBlock, ContactBlockData } from "./blocks/ContactBlock"
import { DividerBlock, DividerBlockData } from "./blocks/DividerBlock"
import { QuoteBlock, QuoteBlockData } from "./blocks/QuoteBlock"
import { TableBlock, TableBlockData } from "./blocks/TableBlock"
import { InstructorBlock, InstructorBlockData } from "./blocks/InstructorBlock"
import { SnakeAnimationBlock, SnakeAnimationBlockData } from "./blocks/SnakeAnimationBlock"

export interface Block {
  blockType: string
  [key: string]: any
}

export function BlockRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.blockType) {
          case "hero": return <HeroBlock key={i} data={block as unknown as HeroBlockData} />
          case "features": return <FeaturesBlock key={i} data={block as unknown as FeaturesBlockData} />
          case "cta": return <CtaBlock key={i} data={block as unknown as CtaBlockData} />
          case "faq": return <FaqBlock key={i} data={block as unknown as FaqBlockData} />
          case "pricing": return <PricingBlock key={i} data={block as unknown as PricingBlockData} />
          case "testimonials": return <TestimonialsBlock key={i} data={block as unknown as TestimonialsBlockData} />
          case "gallery": return <GalleryBlock key={i} data={block as unknown as GalleryBlockData} />
          case "stats": return <StatsBlock key={i} data={block as unknown as StatsBlockData} />
          case "content": return <ContentBlock key={i} data={block as unknown as ContentBlockData} />
          case "text": return <TextBlock key={i} data={block as unknown as TextBlockData} />
          case "image": return <ImageBlock key={i} data={block as unknown as ImageBlockData} />
          case "video": return <VideoBlock key={i} data={block as unknown as VideoBlockData} />
          case "steps": return <StepsBlock key={i} data={block as unknown as StepsBlockData} />
          case "cards": return <CardsBlock key={i} data={block as unknown as CardsBlockData} />
          case "contact": return <ContactBlock key={i} data={block as unknown as ContactBlockData} />
          case "divider": return <DividerBlock key={i} data={block as unknown as DividerBlockData} />
          case "quote": return <QuoteBlock key={i} data={block as unknown as QuoteBlockData} />
          case "table": return <TableBlock key={i} data={block as unknown as TableBlockData} />
          case "instructor": return <InstructorBlock key={i} data={block as unknown as InstructorBlockData} />
          case "snake-animation": return <SnakeAnimationBlock key={i} data={block as unknown as SnakeAnimationBlockData} />
          default:
            console.warn("Unknown block type:", block.blockType)
            return null
        }
      })}
    </>
  )
}
