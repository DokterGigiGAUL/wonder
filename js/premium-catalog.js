const premiumCatalog =
    document.getElementById(
        "premium-catalog-container"
    );


function loadPremiumCatalog() {

    if (!premiumCatalog) return;


    const premiumItems = [

        ...quizzes,
        ...comics,
        ...ttsList,
        ...cases

    ]
    .filter(item => item.premium)
    .sort(
        (a, b) =>
            new Date(b.releaseDate) -
            new Date(a.releaseDate)
    )
    .slice(0, 12);

    premiumItems.forEach(item => {

        createContentCard({

            container: premiumCatalog,

            item: item,

            thumbnail: item.thumbnail,

            title: item.title,

            description: item.description,

            premium: true,

            buttonText: "🔒 Buka",

            onClick() {

                if (
                    !PurchaseManager.hasAccess(item)
                ) {

                    showPremiumDialog(
                        item.productId
                    );

                    return;
                }


                switch (item.type) {

                    case "quiz":

                        location.href =
                            `quiz.html?id=${item.file}`;

                        break;


                    case "comic":

                        location.href =
                            `komik.html?id=${item.id}`;

                        break;


                    case "tts":

                        location.href =
                            `tts.html?puzzle=tts${item.id}`;

                        break;


                    case "case":

                        location.href =
                            `case.html?case=${item.file}`;

                        break;

                }

            }

        });

    });

}


loadPremiumCatalog();
