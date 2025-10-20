import React from "react";

const Cookies = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-100 py-10 px-6 md:px-16 lg:px-32">
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-xl p-8 md:p-12">
        <header className="mb-10 border-b border-gray-200 pb-6">
          <h1 className="text-3xl md:text-4xl font-playfair font-bold text-[#EF7A43] mb-2">
            Politique des Cookies
          </h1>
          <p className="text-gray-600">
            Informations sur l’utilisation des cookies par le site Cabinet RENOV.
          </p>
        </header>

        <div className="prose max-w-none text-gray-800">
          <section id="definition" className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-[#444b51]">1. Définition d’un cookie</h2>
            <p>
              Un cookie est un petit fichier texte déposé sur votre appareil lors de la
              consultation d’un site Internet. Il permet au site de reconnaître votre
              navigateur et d’enregistrer certaines informations.
            </p>
          </section>

          <section id="utilisation" className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-[#444b51]">2. Utilisation des cookies</h2>
            <p>
              Le site <strong>Cabinet RENOV</strong> utilise des cookies pour :
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Améliorer votre expérience de navigation</li>
              <li>Analyser la fréquentation du site via Google Analytics</li>
              <li>Assurer le bon fonctionnement des formulaires et fonctionnalités</li>
            </ul>
          </section>

          <section id="gestion" className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-[#444b51]">3. Gestion des cookies</h2>
            <p>
              Vous pouvez à tout moment désactiver les cookies en paramétrant votre navigateur :
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Sur Chrome : Paramètres → Confidentialité → Cookies</li>
              <li>Sur Firefox : Options → Vie privée → Cookies</li>
              <li>Sur Safari : Préférences → Confidentialité → Cookies</li>
            </ul>
          </section>

          <section id="tiers" className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-[#444b51]">4. Cookies tiers</h2>
            <p>
              Certains cookies proviennent de services tiers (ex : Google, Meta, YouTube) et sont
              soumis à leurs propres politiques de confidentialité.
            </p>
          </section>

          <section id="contact" className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-[#444b51]">5. Contact</h2>
            <p>
              Pour toute question relative à l’utilisation des cookies, vous pouvez contacter :
            </p>
            <div className="bg-gray-50 p-4 rounded-md mt-4">
              <p>Email : <a href="mailto:cabinetrenov@gmail.com" className="text-[#EF7A43] hover:underline">cabinetrenov@gmail.com</a></p>
              <p>Tél : +212 663 628 668</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Cookies;