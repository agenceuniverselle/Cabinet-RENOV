import React from "react";

const MentionsLegales = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-100 py-10 px-6 md:px-16 lg:px-32">
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-xl p-8 md:p-12">
        <header className="mb-10 border-b border-gray-200 pb-6">
          <h1 className="text-3xl md:text-4xl font-playfair font-bold text-[#EF7A43] mb-2">
            Mentions Légales
          </h1>
          <p className="text-gray-600">
            Informations légales relatives à l’exploitation du site
            https://www.cabinetrenov.com/
          </p>
        </header>

        <div className="prose max-w-none text-gray-800">
          <section id="editeur" className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-[#444b51]">1. Éditeur du site</h2>
            <p>
              Le présent site web <strong>https://www.cabinetrenov.com/</strong> est édité par :
            </p>
            <div className="bg-gray-50 p-4 rounded-md mt-4">
              <p><strong>Cabinet RENOV</strong></p>
              <p>Forme juridique : S.A.R.L.</p>
              <p>Capital social : 100 000 DH</p>
              <p>Siège social : Résidence Al Azizia N°22, Rue Royaume d’Arabie Saoudite, Tanger – Maroc</p>
              <p>ICE : 002860191000035</p>
              <p>Tél : +212 663 628 668</p>
              <p>Email : cabinetrenov@gmail.com</p>
            </div>
            <p className="mt-4">Directeur de la société : M. Mohamed Jaaouan</p>
          </section>

          <section id="hebergement" className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-[#444b51]">2. Hébergement</h2>
            <p>Le site est hébergé par :</p>
            <div className="bg-gray-50 p-4 rounded-md mt-4">
              <p><strong>Hostinger</strong></p>
              <p>Type d’hébergement : VPS (Virtual Private Server)</p>
              <p>Infrastructure déployée sous <strong>Docker</strong> et administrée par Cabinet RENOV.</p>
              <p>
                Site web :{" "}
                <a
                  href="https://www.hostinger.com/"
                  className="text-[#EF7A43] hover:underline"
                >
                  https://www.hostinger.com/
                </a>
              </p>
            </div>
          </section>

          <section id="propriete" className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-[#444b51]">3. Propriété intellectuelle</h2>
            <p>
              Le site et son contenu sont protégés par le droit de la propriété intellectuelle.
              Toute reproduction sans autorisation écrite est strictement interdite.
            </p>
          </section>

          <section id="donnees" className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-[#444b51]">4. Données personnelles</h2>
            <p>
              Pour plus d’informations, consultez notre{" "}
              <a href="/politique-de-confidentialite" className="text-[#EF7A43] hover:underline">
                Politique de Confidentialité
              </a>.
            </p>
          </section>

          <section id="cookies" className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-[#444b51]">5. Cookies</h2>
            <p>
              Voir notre{" "}
              <a href="/politique-des-cookies" className="text-[#EF7A43] hover:underline">
                Politique des Cookies
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default MentionsLegales;