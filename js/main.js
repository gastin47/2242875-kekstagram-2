/* 
=================================================
= 1. Загрузка и отображение изображения в модалке =
=================================================
*/
document.addEventListener("DOMContentLoaded", function () {
    const uploadFileInput = document.querySelector("#upload-file");
    const imgUploadOverlay = document.querySelector(".img-upload__overlay");
    const uploadCancelBtn = document.querySelector("#upload-cancel");
    const bodyElement = document.querySelector("body");
    const previewImage = imgUploadOverlay.querySelector("img"); // предполагается, что у вас только одно изображение внутри модального окна

    // 1. Обработка выбора файла изображения
    uploadFileInput.addEventListener("change", function () {
        if (uploadFileInput.files.length > 0) {
            const file = uploadFileInput.files[0];

            // Проверка на тип файла (опционально)
            if (!file.type.startsWith("image/")) {
                alert("Выбран неподдерживаемый тип файла!");
                return;
            }

            const reader = new FileReader();

            reader.onload = function (event) {
                previewImage.src = event.target.result; // устанавливаем загруженное изображение как источник для элемента <img>

                // Показываем форму редактирования изображения
                imgUploadOverlay.classList.remove("hidden");
                bodyElement.classList.add("modal-open");
            };

            reader.readAsDataURL(file); // читаем файл и преобразуем его в DataURL
        }
    });

    // 2. Обработка кнопки закрытия и 3. нажатия клавиши Esc
    function closeUploadOverlay() {
        imgUploadOverlay.classList.add("hidden");
        bodyElement.classList.remove("modal-open");
    }

    uploadCancelBtn.addEventListener("click", closeUploadOverlay);

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeUploadOverlay();
        }
    });
});
/* 
==============================
= 2. Регулировка масштаба изображения =
==============================
*/
const scaleControlSmaller = document.querySelector(".scale__control--smaller");
const scaleControlBigger = document.querySelector(".scale__control--bigger");
const scaleControlValue = document.querySelector(".scale__control--value");
const imgUploadPreview = document.querySelector(".img-upload__preview img");

let currentScale = 100;

function updateScaleValue() {
    scaleControlValue.value = `${currentScale}%`;
    imgUploadPreview.style.transform = `scale(${currentScale / 100})`;
}

scaleControlSmaller.addEventListener("click", function () {
    if (currentScale > 25) {
        currentScale -= 25;
        updateScaleValue();
    }
});

scaleControlBigger.addEventListener("click", function () {
    if (currentScale < 100) {
        currentScale += 25;
        updateScaleValue();
    }
});
/* 
=======================================
= 3. Применение эффектов к изображению =
=======================================
*/
const effectsRadios = document.querySelectorAll(".effects__radio");

effectsRadios.forEach(radio => {
    radio.addEventListener("change", function () {
        // Удаляем все примененные эффекты к изображению
        imgUploadPreview.className = "";

        if (radio.value !== "none") {
            imgUploadPreview.classList.add(`effects__preview--${radio.value}`);
        }
    });
});
/* 
===========================
= 4. Валидация комментария =
===========================
*/
const commentInput = document.querySelector(".text__description");

commentInput.addEventListener("input", function () {
    const commentLength = commentInput.value.length;

    if (commentLength < 20) {
        commentInput.setCustomValidity("Комментарий должен содержать минимум 20 символов");
    } else if (commentLength > 140) {
        commentInput.setCustomValidity("Комментарий не может быть длиннее 140 символов");
    } else {
        commentInput.setCustomValidity("");
    }
    commentInput.reportValidity();
});
/* 
=============================
= 5. Отправка формы на сервер =
=============================
*/
const form = document.querySelector('#upload-select-image');
const submitButton = form.querySelector('button[type="submit"]');

form.addEventListener('submit', function (event) {
    event.preventDefault();

    // Блокируем кнопку отправки
    submitButton.disabled = true;

    // Создаем объект FormData для отправки данных формы
    const formData = new FormData(form);

    // Отправляем AJAX-запрос
    fetch('https://27.javascript.pages.academy/kekstagram-simple', {
        method: 'POST',
        body: formData
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Сетевая ошибка');
            }
            return response.json();
        })
        .then(data => {
            console.log('Данные успешно отправлены:', data);
            showSuccessMessage(); // Показываем сообщение об успешной загрузке
            resetForm();
        })
        .catch(error => {
            // Здесь обрабатываем ошибки сети или сервера
            console.error('Ошибка:', error);
        })
        .finally(() => {
            // В любом случае разблокируем кнопку отправки
            submitButton.disabled = false;
        });
});
/* 
================================
= 6. Функции сброса формы и сообщения об успешной загрузке =
================================
*/
function resetForm() {
    console.log('Поля очищены')
    // Сброс масштаба
    currentScale = 100;
    updateScaleValue();

    // Сброс эффекта
    document.querySelector('.effects__radio[value="none"]').checked = true;
    imgUploadPreview.className = "";

    // Очистка полей комментария и хэш-тегов
    document.querySelector(".text__description").value = '';
    document.querySelector(".text__hashtags").value = '';
    // Очистка поля загрузки фотографии
    document.querySelector("#upload-file").value = '';

    // Закрыть форму редактирования
    document.querySelector(".img-upload__overlay").classList.add("hidden");
    document.body.classList.remove("modal-open");
}
/* 
==================================
= 7. Загрузка изображений с сервера =
==================================
*/
function loadPictures(callback) {
    fetch('https://27.javascript.pages.academy/kekstagram-simple/data')
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка загрузки данных');
            }
            return response.json();
        })
        .then(data => {
            callback(null, data); // Возвращаем данные в callback
        })
        .catch(error => {
            callback(error, null); // Возвращаем ошибку в callback
        });
}
/* 
=====================================
= 8. Создание и отображение миниатюр =
=====================================
*/
function createPictureElement(data) {
    const template = document.querySelector('#picture').content;
    const pictureElement = template.cloneNode(true);

    pictureElement.querySelector('.picture__img').src = data.url;
    pictureElement.querySelector('.picture__likes').textContent = data.likes;
    pictureElement.querySelector('.picture__comments').textContent = data.comments;

    return pictureElement;
}

// Функция для добавления изображений на страницу
function renderPictures(pictures) {
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < pictures.length; i++) {
        const pictureElement = createPictureElement(pictures[i]);
        fragment.appendChild(pictureElement);
    }
    // Предположим, что у вас есть контейнер с классом `pictures` для отображения миниатюр на странице.
    document.querySelector('.pictures').appendChild(fragment);
}

// Загружаем изображения и отображаем их на странице
loadPictures((error, data) => {
    if (error) {
        console.error('Ошибка:', error);
        // Здесь можно добавить код для отображения ошибки пользователю
        // Например, создать и отобразить модальное окно с сообщением об ошибке
    } else {
        renderPictures(data);
    }
});
function showSuccessMessage() {
    const template = document.querySelector("#success").content;
    const successElement = template.querySelector('.success').cloneNode(true);


    const successButton = successElement.querySelector(".success__button");

    // Функция для удаления сообщения об успешной загрузке
    function removeSuccessMessage() {
        successElement.remove();
        successButton.removeEventListener("click", removeSuccessMessage);
        document.removeEventListener("keydown", onSuccessEscapePress);
    }



    // Функция для обработки нажатия клавиши Escape
    function onSuccessEscapePress(event) {
        if (event.key === "Escape") {
            removeSuccessMessage();
        }
    }

    // Добавление обработчика события на кнопку закрытия сообщения
    successButton.addEventListener("click", removeSuccessMessage);
    document.addEventListener("keydown", onSuccessEscapePress);

    document.body.appendChild(successElement);
}
