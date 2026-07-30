// SWIPER

const swiper = new Swiper(".mySwiper", {

    loop:true,

    speed:1000,

    autoplay:{
        delay:4000,
        disableOnInteraction:false,
    },

    pagination:{
        el:".swiper-pagination",
        clickable:true,
    },

    navigation:{
        nextEl:".swiper-button-next",
        prevEl:".swiper-button-prev",
    },

    breakpoints:{

        0:{
            slidesPerView:1,
            spaceBetween:10
        },

        768:{
            slidesPerView:1,
            spaceBetween:20
        },

        1200:{
            slidesPerView:1,
            spaceBetween:30
        }

    }

});

// REDIRECT FUNCTION

function go(url){
    window.location.href = url;
}
