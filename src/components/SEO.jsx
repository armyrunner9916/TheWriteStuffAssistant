import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({
  title,
  description,
  canonical,
  noindex = false,
  nofollow = false,
  ogType = 'website',
  ogImage,
  ogImageAlt,
}) => {
  const siteUrl = 'https://writestuffassistant.com';
  const fullCanonical = canonical ? `${siteUrl}${canonical}` : undefined;

  const robotsContent = `${noindex ? 'noindex' : 'index'},${nofollow ? 'nofollow' : 'follow'}`;

  return (
    <Helmet>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      <meta name="robots" content={robotsContent} />
      {fullCanonical && <link rel="canonical" href={fullCanonical} />}

      {ogType && <meta property="og:type" content={ogType} />}
      {title && <meta property="og:title" content={title} />}
      {description && <meta property="og:description" content={description} />}
      {fullCanonical && <meta property="og:url" content={fullCanonical} />}
      {ogImage && <meta property="og:image" content={ogImage} />}
      {ogImageAlt && <meta property="og:image:alt" content={ogImageAlt} />}
    </Helmet>
  );
};

export default SEO;
