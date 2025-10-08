import { getPokemonDescription, generatePokemonImage } from 'ai';
import { initDB, saveCard, getAllCards } from 'db';

document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const btnText = document.getElementById('btn-text');
    const btnLoader = document.getElementById('btn-loader');
    const newCardContainer = document.getElementById('new-card-container');
    const cardPlaceholder = document.getElementById('card-placeholder');
    const cardLoader = document.getElementById('card-loader');
    const loadingMessage = document.getElementById('loading-message');
    const collectionGrid = document.getElementById('collection-grid');
    const emptyCollectionMessage = document.getElementById('empty-collection-message');
    
    let lastGeneratedCard = null;

    const createCardElement = (card, isNewCollectionCard = false) => {
        const cardEl = document.createElement('div');
        cardEl.className = isNewCollectionCard ? 'pogemon-card collection-card' : 'pogemon-card new';
        cardEl.innerHTML = `
            <div class="card-image-container">
                <img src="${card.imageUrl}" alt="Image of ${card.name}">
            </div>
            <h3 class="card-name">${card.name}</h3>
            <p class="card-type">${card.type}</p>
            <p class="card-description">${card.description}</p>
            <div class="card-stats">
                <p>H: <span>${card.height}</span></p>
                <p>W: <span>${card.weight}</span></p>
            </div>
        `;
        return cardEl;
    };

    const renderCollection = async () => {
        const cards = await getAllCards();
        collectionGrid.innerHTML = '';
        if (cards.length > 0) {
            emptyCollectionMessage.classList.add('hidden');
            cards.reverse().forEach(card => {
                collectionGrid.appendChild(createCardElement(card, true));
            });
        } else {
            emptyCollectionMessage.classList.remove('hidden');
        }
    };

    const toggleLoading = (isLoading) => {
        generateBtn.disabled = isLoading;
        if (isLoading) {
            btnText.classList.add('hidden');
            btnLoader.classList.remove('hidden');
        } else {
            btnText.classList.remove('hidden');
            btnLoader.classList.add('hidden');
        }
    };
    
    const handleGenerateClick = async () => {
        toggleLoading(true);
        cardPlaceholder.classList.add('hidden');
        newCardContainer.innerHTML = ''; // Clear previous card
        newCardContainer.appendChild(cardLoader);
        cardLoader.classList.remove('hidden');
        
        try {
            loadingMessage.textContent = 'Generating description...';
            const descriptionData = await getPokemonDescription(lastGeneratedCard);
            if (descriptionData.error) throw new Error(descriptionData.error);
            
            loadingMessage.textContent = 'Creating image... This may take a moment.';
            const prompt = `A digital illustration of a creature named ${descriptionData.name}. It is a ${descriptionData.type} type. ${descriptionData.description}. The style is clean, vibrant, and suitable for a creature collection game.`;
            const imageUrl = await generatePokemonImage(prompt);
            if (!imageUrl) throw new Error('Image generation failed.');

            const newCard = { ...descriptionData, imageUrl, id: Date.now() };
            
            await saveCard(newCard);
            
            lastGeneratedCard = newCard;
            
            const cardElement = createCardElement(newCard);
            cardLoader.classList.add('hidden');
            newCardContainer.innerHTML = ''; // Clear loader
            newCardContainer.appendChild(cardElement);

            await renderCollection();

        } catch (error) {
            console.error('Generation failed:', error);
            newCardContainer.innerHTML = '<p>Something went wrong. Please try again!</p>';
        } finally {
            toggleLoading(false);
        }
    };

    const initializeApp = async () => {
        await initDB();
        await renderCollection();
        generateBtn.addEventListener('click', handleGenerateClick);
    };
    
    initializeApp();
});

