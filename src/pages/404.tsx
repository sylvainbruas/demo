import React, { useState, useLayoutEffect, useRef } from "react"
import styled from "styled-components"

import Layout from "Layouts/layout"
import SEO from "Components/seo"

const NotFound = () => {
  return (
    <Layout>
      <SEO title="Not found" />
      <Container>
        <TitleWrap>
          <Title>404</Title>
          <Divider />
          <Desc>Page not found</Desc>
        </TitleWrap>
      </Container>
    </Layout>
  )
}

const Container = styled.main`
  position: fixed;
  width: 100%;
  height: 100%;
  background-color: rgb(255, 45, 85);
`

const Divider = styled.div`
  width: 100%;
  height: 4px;
  margin: 1rem 0 1.5rem 0;
  background-color: rgba(255, 255, 255, 0.5);
`

const TitleWrap = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 1;
`

const Title = styled.h1`
  color: white;
  font-size: 8rem;
`

const Desc = styled.h2`
  color: white;
  font-size: 2.5rem;
`

export default NotFound
