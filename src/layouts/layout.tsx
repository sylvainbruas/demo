import React from "react"
import styled, { ThemeProvider } from "styled-components"
import {
  FaGithub,
  FaLinkedin,
  FaEnvelope,
  FaTwitter,
  FaRss
} from "react-icons/fa";
import { BiBadgeCheck } from "react-icons/bi";

import ThemeContext from "Stores/themeContext"
import useTheme from "Hooks/useTheme"
import useSiteMetadata from "Hooks/useSiteMetadata"
import NavBar from "Components/navBar/navBar"
import styledTheme from "Styles/styledTheme"
import GlobalStyle from "Styles/globalStyle"
import packageJSON from "../../package.json"
import {StaticImage} from "gatsby-plugin-image"

const { name, homepage } = packageJSON

const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { theme, themeToggler } = useTheme()
  const { title, author } = useSiteMetadata()
  const copyrightStr = `Copyright © ${author}`

  return (
    <ThemeProvider theme={styledTheme}>
      <ThemeContext.Provider value={theme}>
        <GlobalStyle />
        <Container>
          <NavBar title={title} themeToggler={themeToggler} />
          {children}
        </Container>
        
<div class="post-author"> 
  <hr/> 
    <div class="post-author-box"> 
        <div class="author-image"> 
        <StaticImage src="../images/SylvainBRUAS.png"  alt="Sylvain BRUAS" width={200} height={200}  />
        
        </div> 
        <div class="author-description"> 
          <span class="author-name">Sylvain BRUAS</span> 
          <span class="author-socials"> 
            <a rel="me" href="https://www.linkedin.com/in/sylvainbruas/" target="_blank" rel="noopener noreferrer" > <FaLinkedin className="social-icon" size="16" /> </a> 
            <a rel="me" href="https://github.com/sylvainbruas/" target="_blank" rel="noopener noreferrer"  > <FaGithub className="social-icon" size="16" /> </a> 
            <a rel="me" href="https://twitter.com/sylvain_bruas" target="_blank" rel="noopener noreferrer"  > <FaTwitter className="social-icon" size="16" /> </a>
             <a rel="me" href="https://calendly.com/sylvain-bruas" target="_blank" rel="noopener noreferrer"  > <FaEnvelope className="social-icon" size="16" /> </a> 
             <a rel="me" href="https://www.credly.com/users/sylvain-bruas/badges" target="_blank" rel="noopener noreferrer"  > <BiBadgeCheck className="social-icon" size="16" /> </a>
          </span> 
          <div class="author-short-about"> 
          <p>Je suis architect solution AWS depuis plus de 8 ans. J'interviens dans les grands groupes pour les aider dans leur transformation vers le cloud AWS.
          </p> <p>&nbsp;</p> <p>
              Mes compétences principales sont les fondations AWS, le Dev(SecFin*)Ops et les containers.
            </p> 
          </div> 
        </div> 
    </div> 
</div>
   
        <Footer role="contentinfo">

          <Copyright aria-label="Copyright">
            {copyrightStr}
          </Copyright>
        </Footer>
      </ThemeContext.Provider>
    </ThemeProvider>
  )
}

const Container = styled.div`
  width: 100%;
  height: 100%;
  min-height: calc(100vh - var(--footer-height));
  background-color: var(--color-post-background);
`

const Footer = styled.footer`
  display: flex;
  text-align: center;
  justify-content: center;
  align-items: center;
  height: var(--footer-height);
  background-color: var(--color-gray-1);
`

const Copyright = styled.span`
  font-size: var(--text-sm);
  font-weight: var(--font-weight-regular);
  color: var(--color-gray-6);
`

const RepoLink = styled.a`
  color: var(--color-blue);
  &:hover {
    text-decoration: underline;
  }
`

export default Layout
