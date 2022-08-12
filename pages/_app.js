import '../styles/Global.css'
import '../styles/Header.css'
import '../styles/Rent.css'
import '../styles/Lend.css'
import '../styles/Dashboard.css'
import '../styles/Modal.css'
import Layout from '../components/layout'

function MyApp({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
}

export default MyApp
