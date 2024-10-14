import axios from 'axios';
import 'dotenv/config';

class YaUploader {
   async createFolder(path: string, token: string) {
        const urlCreate = 'https://cloud-api.yandex.net/v1/disk/resources';
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `OAuth ${token}`,
        };
        try {
            await axios.put(`${urlCreate}?path=${path}`, {}, { headers });
                console.log("Folder created");
            
        } catch (error) {
            console.log("Error while creating folder:", error);
        }
    };

    async uploadPhotosToYd(token: string, path: string, urlFile: string, name: string) {
        const url = "https://cloud-api.yandex.net/v1/disk/resources/upload";
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `OAuth ${token}`,
        };
        const params = {
            path: `/${path}/${name}`,
            url: urlFile,
            overwrite: "true"
        };
        try {
            await axios.post(url, {}, { headers, params })
            console.log(`Uploaded: ${name}`);
        } catch (error){
            console.log("Error while upload Photo to Yd", error)
        };
    };
}

async function fetchSubBreeds(breed: string) {
    try {
        const res = await axios.get(`https://dog.ceo/api/breed/${breed}/list`);
        return res.data.message || [];
    } catch (error) {
        console.log("Error fetching sub-breeds:", error);
        return [];
    };
};

async function fetchUrls(breed: string, subBreeds: string[]) {
    const urls: string[] = [];

    try {
        if (subBreeds.length > 0) {
            for (let subBreed of subBreeds) {
                const res = await axios.get(`https://dog.ceo/api/breed/${breed}/${subBreed}/images/random`);
                urls.push(res.data.message);
            }
        } else {
            const res = await axios.get(`https://dog.ceo/api/breed/${breed}/images/random`);
            urls.push(res.data.message);
        }
    } catch (error) {
        console.log("Error fetching URL:", error);
    }

    return urls;
}

async function TestUpload(breed: string, token: string) {
    const yandexClient = new YaUploader();
    const folderPath = '/dog_images';

    await yandexClient.createFolder(folderPath, token);

    const subBreeds = await fetchSubBreeds(breed);
    const urls = await fetchUrls(breed, subBreeds);

    for (const [index, url] of urls.entries()) {
        const name = `image_${index + 1}.jpg`;
        await yandexClient.uploadPhotosToYd(token, folderPath, url, name);
    }
}

// Random breed selection
const breeds = ['doberman', 'bulldog', 'collie'];
const token = process.env.token
const randomBreed = breeds[Math.floor(Math.random() * breeds.length)];
TestUpload(randomBreed, token);
