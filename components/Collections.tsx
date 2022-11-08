import { CollectionsView } from 'common/CollectionsView'
import { FooterSlim } from 'common/FooterSlim'
import { HowItWorks } from 'common/HowItWorks'
import { RentalHero } from 'common/RentalHero'
import type { ProjectConfig } from 'config/config'
import { projectConfigs } from 'config/config'

const categories = Object.entries(projectConfigs).reduce((acc, [, config]) => {
  if (config.hidden) return acc
  console.log('categories:', [acc[config.type]])
  return {
    ...acc,
    [config.type]: [...(acc[config.type] || []), config],
  }
}, {} as { [type: string]: ProjectConfig[] })

export const Collections = () => {
  return (
    <div className="bg-dark-5">
      <RentalHero />
      <div className="mx-auto flex flex-col gap-16 px-8 md:px-16">
        {Object.entries(categories).map(([type, configs], i) => (
          i === 0 ? 
          <CollectionsView
            key={type}
            configs={configs}
            header={
              i === 0
                ? {
                    title: 'collections Profiles',
                    description:
                      'listing assets across multiple collections.',
                  }
                : undefined
            }
          /> : undefined
        ))}
      </div>
      {/* <HowItWorks />
      <FooterSlim /> */}
    </div>
  )
}