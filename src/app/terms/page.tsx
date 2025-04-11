import type { Metadata } from 'next';

const TELEGRAM_CONTACT_LINK = 'https://t.me/SmartScriptsBubble';
const COMPANY_NAME = 'Smart Scripts Automations';
const EFFECTIVE_DATE = 'April 1, 2024';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: `Read the Terms of Service for using ${COMPANY_NAME} scripts and services. Effective ${EFFECTIVE_DATE}.`,
  alternates: {
    canonical: 'https://bubblepy.com/terms',
  },
};

export default function TermsPage() {
  return (
    <main className='flex min-h-screen flex-col items-center py-16 sm:py-24 px-4 sm:px-8'>
      <h1 className='text-3xl font-bold mb-10 text-gray-900 dark:text-white'>
        Terms of Service
      </h1>
      <div className='w-full max-w-3xl prose dark:prose-invert text-gray-700 dark:text-gray-300 text-base space-y-6'>
        <p className='lead text-lg text-gray-600 dark:text-gray-400 !mt-0'>
          Effective Date: {EFFECTIVE_DATE}
        </p>
        <p>
          Welcome to {COMPANY_NAME}! These Terms of Service ({'"'}Terms{'"'})
          govern your access to and use of the website, services, and digital
          software products ({'"'}Products{'"'}, {'"'}Scripts{'"'}) offered by{' '}
          {COMPANY_NAME}
          (referred to as {'"'}we{'"'}, {'"'}us{'"'}, or {'"'}our{'"'}). Please
          read these Terms carefully before using our Service.
        </p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing our website, connecting your wallet, purchasing, or using
          any of our Products or Services, you acknowledge that you have read,
          understood, and agree to be bound by these Terms. If you do not agree
          with these Terms, you must not access or use our Service.
        </p>

        <h2>2. Description of Service and Products</h2>
        <p>
          We provide automated software tools ({'"'}Scripts{'"'}), primarily
          developed in Python, designed for interacting with the Binance Smart
          Chain (BSC) ecosystem. These Products aim to automate various tasks as
          described on the individual product pages. Our service includes the
          sale and instant digital delivery of these Scripts along with usage
          instructions.
        </p>

        <h2>3. Wallet Connection and Security</h2>
        <p>
          Our Service requires you to connect a compatible cryptocurrency wallet
          to interact with product listings and make purchases. You are solely
          responsible for the security of your wallet, private keys, and any
          seed phrases. Our Scripts are designed such that any necessary wallet
          keys or sensitive credentials you provide for their operation are
          stored locally by you (typically in an `.env` file) according to the
          provided instructions. We do not have access to, nor do we store, your
          private keys or wallet credentials. You are responsible for
          implementing adequate security measures when configuring and running
          the Scripts.
        </p>

        <h2>4. Payments and Delivery</h2>
        <p>
          Payments for Products must be made using supported cryptocurrencies
          via the Binance Smart Chain network through your connected wallet.
          Prices are listed on the product pages. You are responsible for
          ensuring you have sufficient funds and paying any associated network
          transaction fees (gas fees).
        </p>
        <p>
          Upon successful confirmation and verification of your payment on the
          blockchain, you will receive instant access to a URL providing the
          purchased Script and its accompanying setup and usage instructions.
          {'"'}Successful confirmation{'"'} is determined solely by our backend
          verification process interacting with the blockchain. Delays in
          blockchain confirmation are outside our control.
        </p>

        <h2>5. License and Use of Products</h2>
        <p>
          Upon successful purchase, you are granted a limited, non-exclusive,
          non-transferable license to use the purchased Script for your own
          personal or internal business purposes, according to the provided
          instructions. You agree not to redistribute, resell, sublicense, rent,
          lease, or otherwise transfer the Script or its access URL to any third
          party.
        </p>
        <p>
          Our instructions may allow for modification of certain script
          parameters (e.g., transaction amounts, configuration settings). You
          may make such modifications as permitted by the instructions for your
          own use. However, reverse engineering, decompiling, or creating
          derivative works beyond the intended configuration is prohibited. All
          intellectual property rights in the Products remain with{' '}
          {COMPANY_NAME}.
        </p>

        <h2>6. Custom Orders</h2>
        <p>
          We may offer custom Script development services based on individual
          client needs. Please contact us via Telegram at{' '}
          <a
            href={TELEGRAM_CONTACT_LINK}
            target='_blank'
            rel='noopener noreferrer'
            className='text-indigo-600 dark:text-indigo-400 hover:underline'
          >
            {TELEGRAM_CONTACT_LINK.replace('https://', '')}
          </a>{' '}
          to discuss your requirements. Terms and pricing for custom orders will
          be agreed upon separately.
        </p>

        <h2>7. Disclaimers and Assumption of Risk</h2>
        <ul>
          <li>
            <strong>No Warranty:</strong> While we state our Scripts are tested
            and intended to be reliable, software inherently may contain bugs or
            limitations. The Products are provided {'"'}AS IS{'"'} and {'"'}AS
            AVAILABLE{'"'} without any warranties of any kind, express or
            implied, including but not limited to warranties of merchantability,
            fitness for a particular purpose, accuracy, or non-infringement. We
            do not guarantee uninterrupted or error-free operation.
          </li>
          <li>
            <strong>No Investment Advice:</strong> Our Products and any
            information provided are for informational and educational purposes
            only and do not constitute financial or investment advice. Trading
            cryptocurrencies and using automated tools involve significant risk,
            including the potential loss of funds. You should conduct your own
            research and consult with a qualified financial advisor before
            making any investment decisions.
          </li>
          <li>
            <strong>Assumption of Risk:</strong> You acknowledge and agree that
            you are solely responsible for your use of the Products and any
            decisions made based on their operation or output. You assume all
            risks associated with cryptocurrency trading, blockchain
            interactions, smart contract risks, and the use of automated
            software, including potential financial losses due to market
            volatility, script errors, configuration mistakes, or network
            issues.
          </li>
        </ul>

        <h2>8. Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by applicable law, {COMPANY_NAME}{' '}
          shall not be liable for any indirect, incidental, special,
          consequential, or punitive damages, or any loss of profits or
          revenues, whether incurred directly or indirectly, or any loss of
          data, use, goodwill, or other intangible losses, resulting from (a)
          your access to or use of or inability to access or use the Service or
          Products; (b) any conduct or content of any third party on the
          Service; (c) any content obtained from the Service; or (d)
          unauthorized access, use, or alteration of your transmissions or
          content, including any financial losses incurred through the use of
          the Products.
        </p>

        <h2>9. Refunds</h2>
        <p>
          Due to the digital nature of our Products and their instant delivery,
          all sales are final. We generally do not offer refunds once a purchase
          is completed and the Product URL has been made accessible. Please
          review product descriptions carefully before purchasing. If you
          encounter significant technical issues preventing the basic intended
          operation of a script as described (excluding configuration errors or
          market condition impacts), please contact us for support.
        </p>

        <h2>10. Termination</h2>
        <p>
          We reserve the right to terminate or suspend your access to our
          Service or license to use our Products immediately, without prior
          notice or liability, for any reason whatsoever, including without
          limitation if you breach these Terms.
        </p>

        <h2>11. Changes to Terms</h2>
        <p>
          We reserve the right, at our sole discretion, to modify or replace
          these Terms at any time. If a revision is material, we will make
          reasonable efforts to provide notice prior to any new terms taking
          effect. What constitutes a material change will be determined at our
          sole discretion. By continuing to access or use our Service after
          those revisions become effective, you agree to be bound by the revised
          terms.
        </p>

        <h2>12. Governing Law</h2>
        <p>
          These Terms shall be governed and construed in accordance with the
          laws of the State of Delaware, USA, without regard to its conflict of
          law provisions.
        </p>

        <h2>13. Contact Us</h2>
        <p>
          If you have any questions about these Terms or require support, please
          contact us via Telegram:{' '}
          <a
            href={TELEGRAM_CONTACT_LINK}
            target='_blank'
            rel='noopener noreferrer'
            className='text-indigo-600 dark:text-indigo-400 hover:underline'
          >
            {TELEGRAM_CONTACT_LINK.replace('https://', '')}
          </a>
          .
        </p>
      </div>
    </main>
  );
}
