import { ReactNode } from 'react'
import Image from 'next/image'
import { Button } from './ui/button'
import Link from 'next/link'

interface EmptyStateProps {
  title: string;
  description?: string;
  search?: boolean;
  buttonLink?: string;
  buttonText?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

const EmptyState = ({ 
  title, 
  description, 
  search, 
  buttonLink, 
  buttonText, 
  icon, 
  action 
}: EmptyStateProps) => {
  return (
    <section className="flex-center size-full flex-col gap-3">
      {icon ? (
        <div className="mb-2">{icon}</div>
      ) : (
        <Image src="/icons/emptyState.svg" width={250} height={250} alt="empty state" />
      )}
      <div className="flex-center w-full max-w-[400px] flex-col gap-3">
        <h1 className="text-16 text-center font-medium text-white-1">{title}</h1>
        
        {description && (
          <p className="text-16 text-center font-medium text-white-2">{description}</p>
        )}
        
        {search && !description && (
          <p className="text-16 text-center font-medium text-white-2">
            Try adjusting your search to find what you are looking for
          </p>
        )}
        
        {action && (
          <div className="mt-2">{action}</div>
        )}
        
        {buttonLink && !action && (
          <Button className="bg-orange-1">
            <Link href={buttonLink} className="gap-1 flex">
              <Image
                src="/icons/discover.svg"
                width={20}
                height={20}
                alt='discover'
              />
              <h1 className="text-16 font-extrabold text-white-1">{buttonText}</h1>
            </Link>
          </Button>
        )}
      </div>
    </section>
  )
}

export default EmptyState