import React from "react"
import gql from "graphql-tag";
import { useQuery } from '@apollo/react-hooks';

import Img from "gatsby-image"
import CircularProgress from '@material-ui/core/CircularProgress';

interface Props {
  filepath: string
}

const ToppingImage = ({ filepath }:Props) => {
  
  const imageQuery = gql`
    query ToppingImgQuery ($filename: String) {
      toppingsImage: file(relativePath: { eq: $filename }) {
        childImageSharp {
          fluid(maxWidth: 250) {
            base64
            aspectRatio
            src
            srcSet
            sizes
          }
        }
      }
    }
  `;

  const { data, loading, error } = useQuery(
    imageQuery,
    {
      variables: {
        filename: filepath
      }
    });

  return (
    loading ? <CircularProgress /> : (
    error ? <div>{error.message}: {filepath}</div> :
        <Img fluid={data.toppingsImage.childImageSharp.fluid} />)
  )
}

export default ToppingImage
