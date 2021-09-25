//функция срабатывающая после того как весь контент на странице загрузится
window.onload = function () {
    //обработка события клик на всём документе
    document.addEventListener("click", documentActions);
    //Actions делегирование события клик
    function documentActions(e) {
        const targetElement = e.target; //присваеваем в константу объект на который мы нажали
        //ширина экрана, и функция которая вернёт true, когда устройство с тачскрином
        if (window.innerWidth > 768 && isMobile.any()) {
            //проверяем у элемента на который кликнули наличие нужного нам класса
            if (targetElement.classList.contains('menu__arrow')) {
                //обращаемся к родительскому элементу и добавляем ему нужный класс
                targetElement.closest('.menu__item').classList.toggle('_hover');
            }
            //проверяем, что мы кликаем не на пункт меню и что вообще существует открытое подменю
            if (!targetElement.closest('.menu__item') && document.querySelectorAll('.menu__item._hover').length > 0) {
                //Функция лежит в файле functions и удаляет соответсвенно из коллекции объектов нужный класс
                _removeClasses(document.querySelectorAll('.menu__item._hover'), "_hover");
            }
        }
            //тут уже логика поиска
            //проверяем у элемента на который кликнули наличие нужного нам класса
            if (targetElement.classList.contains('search-form__icon')) {
                //добавляем класс объекту
                document.querySelector('.search-form').classList.toggle('_active')
            }
            //кликаем на элемент не содержащий у себя в родителях искомый класс и убеждаемся что элемент
            //который мы хотим закрыть открыт
            else if (!targetElement.closest('.search-form') && document.querySelector('.search-form._active')) {
                //удаляем класс у объекта
                document.querySelector('.search-form').classList.remove('_active')
            }
        if (targetElement.classList.contains('products__more')) {
            getProducts(targetElement);//отправляем кнопку в функцию
            //отменяет действие по умолчанию
            //отменяет перезагрузку страницы при нажатии на нашу кнопку, т.к она является ссылкой
            //e.preventDefault();
        }
        if (targetElement.classList.contains('actions-products__cart')) {
            const productId = targetElement.closest('.item-products').dataset.pid;
            addToCart(targetElement, productId);
            e.preventDefault();
        }
        if (targetElement.classList.contains('cart-header__icon') || targetElement.closest('.cart-header__icon')) {
            if (document.querySelector('.cart-list').children.length > 0) {
                document.querySelector('.cart-header').classList.toggle('_active');
            }
            e.preventDefault();
        } else if (!targetElement.closest('.cart-header') && !targetElement.classList.contains('actions-products__cart')) {
            document.querySelector('.cart-header').classList.remove('_active');
        }
        
        if (targetElement.classList.contains('cart-list__delete')) {
            const productId = targetElement.closest('.cart-list__item').dataset.cartPid;
            updateCart(targetElement, productId, false);
            e.preventDefault();
        }
        if (targetElement.classList.contains('actions-products__like')) {
            const productId = targetElement.closest('.item-products').dataset.pid;
            if (!targetElement.classList.contains('_liked')) {
                targetElement.classList.add('_liked');
                likes(productId);
            } else {
                targetElement.classList.remove('_liked');
                likes(productId, false);
            }
            e.preventDefault();
        }
        if (targetElement.classList.contains('like-header__icon') || targetElement.closest('.like-header__icon')) {
            if (document.querySelector('.like-list').children.length > 0) {
                document.querySelector('.like-header').classList.toggle('_active');
            }
            e.preventDefault();
        } else if (!targetElement.closest('.like-header') && !targetElement.classList.contains('actions-products__like')) {
            document.querySelector('.like-header').classList.remove('_active');
        }
        if (targetElement.classList.contains('like-list__delete')) {
            const productId = targetElement.closest('.like-list__item').dataset.likePid;
            likes(productId, false);
            e.preventDefault();
        }
        if (targetElement.classList.contains('share-product__button')) {
            targetElement.parentNode.classList.toggle('_active');
        }
    }
    //Header
    const headerElement = document.querySelector('.header');

    const callback = function (entries, observer) {
        if (entries[0].isIntersecting) {
            headerElement.classList.remove('_scroll');
        } else {
            headerElement.classList.add('_scroll');
        }
    }

    //Слежка за объектом
    const headerObserver = new IntersectionObserver(callback);
    headerObserver.observe(headerElement);


    //Load More Products
    async function getProducts(button) {
        if (!button.classList.contains('_hold')) {
            button.classList.add('_hold');
            const file = "json/products.json";
            let response = await fetch(file, {
                method: "GET"
            })
            if (response.ok) {
                let result = await response.json();
                loadProducts(result);
                button.classList.remove('_hold');
                button.remove();
            } else {
                alert("Ошибка");
            }
        }
    }
    //Load Products
    function loadProducts(data) {
        const productsItems = document.querySelector('.products__items');
        data.products.forEach(item => {
            const productId = item.id;
            const productUrl = item.url;
            const productImage = item.image;
            const productTitle = item.title;
            const productText = item.text;
            const productPrice = item.price;
            const productOldPrice = item.priceold;
            const productLabels= item.labels;

            let productTemplateStart = `<article data-pid="${productId}" class="products__item item-products">`;
            let productTemplateEnd = `</article>`;

            let productTemplateLabels = '';
            if (productLabels) {
                let productTemplateLabelsStart = `<div class="item-products__labels">`;
                let productTemplateLabelsEnd = `</div>`;
                let productTemplateLabelsContent = '';

                productLabels.forEach(labelItem => {
                    productTemplateLabelsContent +=
                        `<div class="item-products__label item-products__label_${labelItem.type}">
                        ${labelItem.value}
                    </div>`
                });

                productTemplateLabels += productTemplateLabelsStart;
                productTemplateLabels += productTemplateLabelsContent;
                productTemplateLabels += productTemplateLabelsEnd;
            }
			
            let productTemplateImage =
                `<a href="${productUrl}" class="item-products__image _ibg">
					<img src="img/products/${productImage}" alt="${productTitle}">
				</a>`;
            
            let productTemplateBodyStart = `<div class="item-products__body">`;
            let productTemplateBodyEnd = `</div>`;

            let productTemplateContent =
                `<div class="item-products__content">
					<h5 class="item-products__title">${productTitle}</h5>
					<div class="item-products__text">${productText}</div>
				</div>`;
            
            let productTemplatePrices = '';
            let productTemplatePricesStart = `<div class="item-products__prices">`;
            let productTemplatePricesCurrent =
                `<div class="item-products__price">Rp ${productPrice}</div>`;
            let productTemplatePricesOld =
                `<div class="item-products__price_old">Rp ${productOldPrice}</div>`;
            let productTemplatePricesEnd = `</div>`;

            productTemplatePrices = productTemplatePricesStart;
            productTemplatePrices += productTemplatePricesCurrent;
            if (productOldPrice) {
                productTemplatePrices += productTemplatePricesOld;
            }
            productTemplatePrices += productTemplatePricesEnd;
									
            let productTemplateActions =
                `<div class="item-products__actions actions-products">
										<div class="actions-products__body">
											<button type="button" class="actions-products__cart btn btn_white">Add to cart</button>
											<div class="actions-products__share share-product">
												<button type="button" class="share-product__button actions-products-button _icon-share">
													Share
												</button>
												<div class="share-product__links share-product-links">
													<a class="share-product-links__item _icon-facebook" href="https://www.facebook.com/sharer/sharer.php?u=http://185.84.34.184/" target="_blank">Facebook</a>
													<a class="share-product-links__item _icon-twitter" href="https://twitter.com/share?url=http://185.84.34.184/&text=FuniroFurniture" target="_blank">Twitter</a>
													<a class="share-product-links__item _icon-tumblr" href="http://www.tumblr.com/share?v=3&u=http://185.84.34.184/&t=FuniroFurniture" target="_blank">Tumblr</a>
												</div>
											</div>
											<button type="button" class="actions-products__like actions-products-button _icon-like">Like</button>
										</div>
									</div>`;
            let productTemplateBody = '';
            productTemplateBody += productTemplateBodyStart;
            productTemplateBody += productTemplateContent;
            productTemplateBody += productTemplatePrices;
            productTemplateBody += productTemplateActions;
            productTemplateBody += productTemplateBodyEnd;

            let productTemplate = '';
            productTemplate += productTemplateStart;
            productTemplate += productTemplateLabels;
            productTemplate += productTemplateImage;
            productTemplate += productTemplateBody;
            productTemplate += productTemplateEnd;

            productsItems.insertAdjacentHTML('beforeend', productTemplate);
        });
    }

    //Add To Cart
    function addToCart(productButton, productId) {
        if (!productButton.classList.contains('_hold')) {
            productButton.classList.add('_hold');
            productButton.classList.add('_fly');

            const cart = document.querySelector('.cart-header__icon');
            const product = document.querySelector(`[data-pid="${productId}"]`);
            const productImage = product.querySelector('.item-products__image');

            const productImageFly = productImage.cloneNode(true);

            const productImageFlyWidth = productImage.offsetWidth;
            const productImageFlyHeight = productImage.offsetHeight;
            const productImageFlyTop = productImage.getBoundingClientRect().top;
            const productImageFlyLeft = productImage.getBoundingClientRect().left;

            productImageFly.setAttribute('class', '_flyImage _ibg');
            productImageFly.style.cssText =
                `
                left: ${productImageFlyLeft}px;
                top: ${productImageFlyTop}px;
                width: ${productImageFlyWidth}px;
                height: ${productImageFlyHeight}px;
            `;
            document.body.append(productImageFly);

            const cartFlyLeft = cart.getBoundingClientRect().left;
            const cartFlyTop = cart.getBoundingClientRect().top;

            productImageFly.style.cssText =
                `
                left: ${cartFlyLeft}px;
                top: ${cartFlyTop}px;
                width: 0px;
                height: 0px;
                opacity: 0;
            `;

            productImageFly.addEventListener('transitionend', function () {
                if (productButton.classList.contains('_fly')) {
                    productImageFly.remove();
                    updateCart(productButton, productId);
                    productButton.classList.remove('_fly');
                }
            });
        }
    }

    //Update Cart
    function updateCart(productButton, productId, productAdd = true) {
        const cart = document.querySelector('.cart-header');
        const cartIcon = cart.querySelector('.cart-header__icon');
        const cartQuantity = cartIcon.querySelector('span');
        const cartProduct = document.querySelector(`[data-cart-pid="${productId}"]`);
        const cartList = document.querySelector('.cart-list');

        //Добавляем
        if (productAdd) {
            if (cartQuantity) {
                cartQuantity.innerHTML = ++cartQuantity.innerHTML;
            } else {
                cartIcon.insertAdjacentHTML('beforeend', `<span>1</span>`);
            }

            if (!cartProduct) {
                const product = document.querySelector(`[data-pid="${productId}"]`);
                const cartProductImage = product.querySelector('.item-products__image').innerHTML;
                const cartProductTitle = product.querySelector('.item-products__title').innerHTML;

                const cartProductContent =
                    `<a href="" class="cart-list__image _ibg">${cartProductImage}</a>
                    <div class="cart-list__body">
                        <a href="" class="cart-list__title">${cartProductTitle}</a>
                        <div class="cart-list__quantity">Quantity: <span>1</span></div>
                        <a href="" class="cart-list__delete">Delete</a>
                    </div>`;
                cartList.insertAdjacentHTML('beforeend', `<li data-cart-pid="${productId}" class="cart-list__item">${cartProductContent}</li>`);
            } else {
                const cartProductQuantity = cartProduct.querySelector('.cart-list__quantity span');
                cartProductQuantity.innerHTML = ++cartProductQuantity.innerHTML;
            }

            productButton.classList.remove('_hold');
        } else {
            const cartProductQuantity = cartProduct.querySelector('.cart-list__quantity span');
            cartProductQuantity.innerHTML = --cartProductQuantity.innerHTML;
            if (!parseInt(cartProductQuantity.innerHTML)) {
                cartProduct.remove();
            }

            const cartQuantityValue = --cartQuantity.innerHTML;

            if (cartQuantityValue) {
                cartQuantity.innerHTML = cartQuantityValue;
            } else {
                cartQuantity.remove();
                cart.classList.remove('_active');
            }
        }
    }

    function likes(productId, productAdd = true) {
        const likes = document.querySelector('.like-header');
        const product = document.querySelector(`[data-pid="${productId}"]`);
        const likeProduct = document.querySelector(`[data-like-pid="${productId}"]`);
        const likeList = document.querySelector('.like-list');

        //Добавляем
        if (productAdd) {
            const likeProductImage = product.querySelector('.item-products__image').innerHTML;
            const likeProductTitle = product.querySelector('.item-products__title').innerHTML;

            const likeProductContent = `
                <a href="" class="like-list__image _ibg">${likeProductImage}</a>
                <div class="like-list__body">
                    <a href="" class="like-list__title">${likeProductTitle}</a>
                    <a href="" class="like-list__delete">Delete</a>
                </div>
            `;
            likeList.insertAdjacentHTML('beforeend', `<li data-like-pid="${productId}" class="like-list__item">${likeProductContent}</li>`);
            
            likes.classList.add('_color');
        } else {
            likeProduct.remove();
            product.querySelector('.actions-products__like').classList.remove('_liked');
            const liked = document.querySelectorAll('.actions-products__like._liked');
            if (liked.length == 0) {
                likes.classList.remove('_color');
                likes.classList.remove('_active');
            }
        }
    }

    //Furniture gallery
    const furniture = document.querySelector('.furniture__body');
    if(furniture && !isMobile.any()) {
        const furnitureItems = document.querySelector('.furniture__items');
        const furnitureColumn = document.querySelectorAll('.furniture__column');

        const speed = furniture.dataset.speed;

        let positionX = 0;
        let coordXprocent = 0;

        function setMouseGalleryStyle() {
            let furnitureItemsWidth = 0;
            furnitureColumn.forEach(element => {
                furnitureItemsWidth += element.offsetWidth;
            });

            const furnitureDifferent = furnitureItemsWidth - furniture.offsetWidth;
            const distX = Math.floor(coordXprocent - positionX);

            positionX = positionX + (distX * speed);
            let position = furnitureDifferent / 200 * positionX;

            furnitureItems.style.cssText = `transform: translate3d(${-position}px,0,0);`;

            if (Math.abs(distX) > 0) {
                requestAnimationFrame(setMouseGalleryStyle);
            } else {
                furniture.classList.remove('_init');
            }
        }

        furniture.addEventListener("mousemove", function (e) {
            const furnitureWidth = furniture.offsetWidth;

            const coordX = e.pageX - furnitureWidth / 2;

            coordXprocent = coordX / furnitureWidth * 200;

            if (!furniture.classList.contains('_init')) {
                requestAnimationFrame(setMouseGalleryStyle);
                furniture.classList.add('_init');
            }
        });
    }
}