import React from "react"


import useSiteMetadata from "Hooks/useSiteMetadata"
import defaultOpenGraphImage from "../images/og-default.png"

const DEFAULT_LANG = "en"

type Meta = React.DetailedHTMLProps<
  React.MetaHTMLAttributes<HTMLMetaElement>,
  HTMLMetaElement
>[]

interface SEOProps extends Pick<Queries.MarkdownRemarkFrontmatter, "title"> {
  desc?: Queries.Maybe<string>
  image?: Queries.Maybe<string>
  meta?: Meta
}



const SEO: React.FC<SEOProps> = ({ title, desc = "", image, tags,  children }) => {
  const site = useSiteMetadata()
  const description = desc || site.description
  const ogImageUrl =
    site.siteUrl ?? "" + (image || (defaultOpenGraphImage as string))

  return (
    <>
    <link rel="dns-prefetch" href="https://region1.google-analytics.com/" />
<link rel="preconnect"href="https://www.googletagmanager.com"/>
<link rel="dns-prefetch"href="https://www.googletagmanager.com"/>
    <meta name="robots" content="index, follow" />
    <meta name="revisit-after" content="1 days" />
    <meta name="ICBM" content="45.7754397,4.873" />
    <title>{title ?? ""}</title>
    <meta name="description" content={description} />
    <meta name="image" content={ogImageUrl} />

    <meta itemProp="name" content={site.author} />
    <meta itemProp="description" content={description} />
    <meta itemProp="image" content={ogImageUrl} />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title ?? ""} />
    <meta name="twitter:url" content={site.siteUrl} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:creator" content={site.author} />
    <meta name="twitter:domain" content="sylvain.bruas.fr" />
    <meta name="twitter:image:width" content="152" />
    <meta name="twitter:image:height" content="152" />
    <meta name="twitter:image" content={ogImageUrl} />
    <meta name="twitter:image:src" content={ogImageUrl} />

    <meta name="og:title" content={title ?? ""} />
    <meta name="og:type" content="article" />
    <meta name="og:description" content={description} />
    <meta name="og:image" content={ogImageUrl} />
    <meta name="keywords" content={tags && tags.join(`, `)} />

      <meta property="og:locale" content="fr_FR" />
      <meta property="og:url" content={site.siteUrl} />
      <meta property="og:image"  content={ogImageUrl}  />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:height" content="256" />
      <meta property="og:image:width" content="256" />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content={site.author} />

    <meta name="image" content={ogImageUrl} />

    <meta name="DC.Identifier" content={site.siteUrl} />
    <meta name="DC.Title" content={title ?? ""} />
    <meta name="DC.Subject" content={description} />
    <meta name="DC.format" content="text/html" />
    <meta name="DC.publisher" content={site.author} />
    
      <meta name="author" content={site.author} />
      <meta name="copyright" content={site.author} />
<link rel="alternate"type="application/rss+xml"title="Sylvain BRUAS&#x27;s RSS Feed"href="/rss.xml"/>



    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='0.9em' font-size='90'>👤</text></svg>" />
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    {children}
  </>
  )
}

export default SEO

