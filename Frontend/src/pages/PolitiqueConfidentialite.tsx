import React from "react";

const PolitiqueConfidentialite = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-100 py-10 px-6 md:px-16 lg:px-32">
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-xl p-8 md:p-12">
        <header className="mb-10 border-b border-gray-200 pb-6">
          <h1 className="text-3xl md:text-4xl font-playfair font-bold text-[#EF7A43] mb-2">
            Politique de Confidentialité
          </h1>
          <p className="text-gray-600">
            Comment Cabinet RENOV collecte, utilise et protège vos données personnelles.
          </p>
        </header>

        <div className="prose max-w-none text-gray-800">
          <section id="collecte" className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-[#444b51]">1. Collecte des données</h2>
            <p>
              Nous collectons uniquement les données personnelles nécessaires au traitement de vos demandes :
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Nom et prénom</li>
              <li>Adresse e-mail</li>
              <li>Numéro de téléphone</li>
              <li>Message transmis via nos formulaires</li>
            </ul>
          </section>

          <section id="utilisation" className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-[#444b51]">2. Utilisation des données</h2>
            <p>
              Les informations collectées sont utilisées exclusivement pour :
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Répondre à vos demandes de contact ou devis</li>
              <li>Vous informer sur nos formations ou services</li>
              <li>Améliorer nos services et notre communication</li>
            </ul>
          </section>

          <section id="conservation" className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-[#444b51]">3. Durée de conservation</h2>
            <p>
              Vos données personnelles sont conservées pendant une durée maximale de 3 ans après le dernier contact, sauf obligation légale contraire.
            </p>
          </section>

          <section id="partage" className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-[#444b51]">4. Partage des données</h2>
            <p>
              Nous ne partageons jamais vos données personnelles avec des tiers à des fins commerciales.
              Elles peuvent être transmises uniquement à des prestataires techniques intervenant dans le cadre de nos activités (hébergement, maintenance...).
            </p>
          </section>

          <section id="droits" className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-[#444b51]">5. Vos droits</h2>
            <p>
              Conformément à la loi marocaine sur la protection des données personnelles, vous disposez des droits suivants :
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Droit d’accès et de rectification de vos données</li>
              <li>Droit à l’effacement (“droit à l’oubli”)</li>
              <li>Droit d’opposition à leur traitement</li>
            </ul>
            <p className="mt-2">
              Pour exercer ces droits, contactez-nous à :
              <a href="mailto:cabinetrenov@gmail.com" className="text-[#EF7A43] hover:underline ml-1">
                cabinetrenov@gmail.com
              </a>
            </p>
          </section>

          <section id="securite" className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-[#444b51]">6. Sécurité des données</h2>
            <p>
              Nous mettons en œuvre toutes les mesures techniques et organisationnelles nécessaires pour protéger vos données contre toute perte, accès non autorisé ou divulgation.
            </p>
          </section>

          <section id="modification" className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-[#444b51]">7. Modifications de la politique</h2>
            <p>
              Cabinet RENOV se réserve le droit de modifier la présente politique de confidentialité à tout moment. Dernière mise à jour : 14 octobre 2025.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PolitiqueConfidentialite;