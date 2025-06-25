<template>
  <div class="container mx-auto p-8 mt-10">
    <h1 class="text-3xl font-bold mb-6">
      {{ exhibitId ? "编辑展品" : "创建新展品" }}
    </h1>

    <form @submit.prevent="saveExhibit">
      <div class="mb-6">
        <label
          for="exhibit-title"
          class="block text-sm font-medium text-gray-700 mb-1"
          >展品标题</label
        >
        <input
          type="text"
          id="exhibit-title"
          v-model="exhibit.title"
          required
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div class="mb-6">
        <label
          for="exhibit-description"
          class="block text-sm font-medium text-gray-700 mb-1"
          >展品描述</label
        >
        <textarea
          id="exhibit-description"
          v-model="exhibit.description"
          rows="4"
          required
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        ></textarea>
      </div>

      <div class="mb-6">
        <label
          for="exhibit-privacy"
          class="block text-sm font-medium text-gray-700 mb-1"
          >可见范围</label
        >
        <select
          v-model="exhibit.privacy"
          class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="public">公开 (所有人可见)</option>
          <option value="private">私有 (仅自己可见)</option>
          <option value="invite-only">邀请可见 (需邀请)</option>
        </select>
      </div>

      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2"
          >选择封面图 (可选)</label
        >
        <div
          v-if="exhibit.items.length > 0"
          class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
        >
          <div
            v-for="item in exhibit.items"
            :key="item.id"
            :class="[
              'relative border rounded-lg overflow-hidden cursor-pointer',
              {
                'ring-2 ring-indigo-500':
                  exhibit.coverUrl === (item.imageUrl || item.previewUrl),
              },
            ]"
            @click="selectCoverImage(item)"
          >
            <img
              :src="item.previewUrl || item.imageUrl"
              :alt="item.title || '图片预览'"
              class="w-full h-24 object-cover"
              loading="lazy"
            />
            <div
              class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center text-white text-sm font-semibold opacity-0 hover:opacity-100 transition-opacity"
            >
              选择为封面
            </div>
          </div>
        </div>
        <p v-else class="text-sm text-gray-500">
          请先上传图片，然后选择封面图。
        </p>
        <p v-if="exhibit.coverUrl" class="text-sm text-gray-600 mt-2">
          当前封面图:
          <img
            :src="exhibit.coverUrl"
            class="inline-block h-8 w-8 object-cover rounded-full ml-2"
            loading="lazy"
          />
        </p>
        <button
          v-if="exhibit.coverUrl"
          type="button"
          @click="clearCoverImage"
          class="mt-2 text-red-500 hover:text-red-700 text-sm"
        >
          取消封面图
        </button>
      </div>

      <div class="mb-6">
        <label
          for="image-upload"
          class="block text-sm font-medium text-gray-700 mb-1"
          >上传图片 (可多选)</label
        >
        <input
          type="file"
          id="image-upload"
          @change="handleImageUpload"
          multiple
          accept="image/*"
          class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />
      </div>

      <div v-if="exhibit.items.length > 0" class="mb-6">
        <h2 class="text-xl font-semibold mb-3">展品图片</h2>
        <p class="text-sm text-gray-500 mb-3">拖拽图片调整顺序。</p>
        <draggable
          v-model="exhibit.items"
          item-key="id"
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
        >
          <template #item="{ element: item, index }">
            <div class="border p-4 rounded-lg shadow">
              <img
                :src="item.previewUrl || item.imageUrl"
                :alt="item.title || '图片预览'"
                class="w-full h-48 object-cover rounded-md mb-3"
                loading="lazy"
              />
              <div class="mb-2">
                <label
                  :for="`item-title-${index}`"
                  class="block text-xs font-medium text-gray-700"
                  >标题</label
                >
                <input
                  type="text"
                  :id="`item-title-${index}`"
                  v-model="item.title"
                  class="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div class="mb-2">
                <label
                  :for="`item-description-${index}`"
                  class="block text-xs font-medium text-gray-700"
                  >描述</label
                >
                <textarea
                  :id="`item-description-${index}`"
                  v-model="item.description"
                  rows="2"
                  class="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500"
                ></textarea>
              </div>
              <button
                type="button"
                @click="removeItem(index)"
                class="text-red-500 hover:text-red-700 text-sm"
              >
                移除图片
              </button>
            </div>
          </template>
        </draggable>
      </div>
      <div
        v-else
        class="mb-6 p-4 border rounded-md bg-gray-50 text-center text-gray-600"
      >
        <p>尚未添加任何图片。</p>
      </div>

      <div class="mt-8">
        <button
          type="submit"
          :disabled="sending"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-600/50 disabled:cursor-not-allowed"
        >
          {{ exhibitId ? "更新展品" : "创建展品" }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>

import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import draggable from "vuedraggable";
const { $auth } = useNuxtApp();

definePageMeta({
  middleware: "auth", // 指定应用 'auth' 中间件
  requiresAuth: true, // 自定义一个属性，用于在中间件中判断
});

const sending = ref(false);
const route = useRoute();
const router = useRouter();
const exhibitId = route.query.id; // Get ID from query parameters for editing

const exhibit = ref({
  title: "",
  description: "",
  privacy: "public", // Default privacy
  coverUrl: null, // New: cover image URL
  items: [], // Stores images and their info: { id, file?, previewUrl?, imageUrl?, title, description }
});

// Load existing exhibit data if in edit mode
onMounted(async () => {
  if (exhibitId) {
    try {
      const response = await fetch(`/api/exhibit/${exhibitId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      exhibit.value = data.exhibit;
      exhibit.value.items = data.exhibit.datas;
      // Ensure coverUrl is set if it exists in loaded data, or pick one if not
      if (!exhibit.value.coverUrl && exhibit.value.items.length > 0) {
        exhibit.value.coverUrl =
          exhibit.value.items[0].imageUrl || exhibit.value.items[0].previewUrl;
      }
    } catch (error) {
      console.error("Failed to load exhibit:", error);
      alert("加载展品失败，请稍后重试。");
      // Optionally redirect or show an error message
    }
  }
});

// const handleImageUpload = (event) => {
//   const files = Array.from(event.target.files);
//   files.forEach((file) => {
//     const reader = new FileReader();
//     reader.onload = (e) => {
//       const newItem = {
//         // Temporary ID for new files. Actual ID will come from backend after upload.
//         id: `new-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
//         file: file, // Store original file object for upload
//         previewUrl: e.target.result, // For local preview
//         imageUrl: null, // Placeholder for the actual URL after upload
//         title: "",
//         description: "",
//       };
//       exhibit.value.items.push(newItem);

//       // If no cover image is set, and this is the first image, set it as cover
//       if (!exhibit.value.coverUrl) {
//         exhibit.value.coverUrl = newItem.previewUrl;
//       }
//     };
//     reader.readAsDataURL(file);
//   });
//   event.target.value = null; // Clear file input so the same file can be selected again
// };

function sanitizeFileName(fileName) {
  return fileName.replace(/[^\w\u4e00-\u9fff\-\.]/gi, "_");
}

const removeItem = (index) => {
  // If the removed item was the cover, clear coverUrl
  const removedItemUrl =
    exhibit.value.items[index].imageUrl ||
    exhibit.value.items[index].previewUrl;
  if (exhibit.value.coverUrl === removedItemUrl) {
    exhibit.value.coverUrl = null;
  }
  exhibit.value.items.splice(index, 1);

  // If there are still items but no cover, set a new random cover
  if (!exhibit.value.coverUrl && exhibit.value.items.length > 0) {
    const randomIndex = Math.floor(Math.random() * exhibit.value.items.length);
    exhibit.value.coverUrl =
      exhibit.value.items[randomIndex].imageUrl ||
      exhibit.value.items[randomIndex].previewUrl;
  }
};

const selectCoverImage = (item) => {
  exhibit.value.coverUrl = item.imageUrl || item.previewUrl;
};

const clearCoverImage = () => {
  exhibit.value.coverUrl = null;
};

const handleImageUpload = (event) => {
  const files = Array.from(event.target.files);

  // 使用Promise.all处理多文件上传
  const promises = files.map((file) => {
    return new Promise((resolve) => {
      // 处理中文文件名
      const sanitizedFile = new File([file], sanitizeFileName(file.name), {
        type: file.type,
        lastModified: file.lastModified,
      });

      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({
          id: `new-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          file: sanitizedFile, // 使用处理后的文件名
          previewUrl: e.target.result,
          imageUrl: null,
          title: "",
          description: "",
        });
      };
      reader.readAsDataURL(sanitizedFile);
    });
  });

  // 批量添加处理后的文件
  Promise.all(promises).then((newItems) => {
    exhibit.value.items.push(...newItems);

    if (!exhibit.value.coverUrl && newItems.length > 0) {
      exhibit.value.coverUrl = newItems[0].previewUrl;
    }
  });

  event.target.value = null;
};

const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await fetch("/api/exhibit/upload-image", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.statusMessage || "Image upload failed");
    }
    const data = await response.json();
    return data; // 后端现在返回包含 imageUrl 和 previewUrl 的对象
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

const saveExhibit = async () => {
  // 防止重复提交
  if (sending.value) return;
  sending.value = true;

  try {
    const uploadPromises = exhibit.value.items
      .filter((item) => item.file)
      .map(async (item) => {
        // 添加文件类型检查
        if (!item.file.type.startsWith("image/")) {
          throw new Error("只能上传图片文件");
        }

        const uploadedImage = await uploadImage(item.file); // 后端现在返回包含 imageUrl 和 previewUrl 的对象
        if (exhibit.value.coverUrl === item.previewUrl) {
          exhibit.value.coverUrl = uploadedImage.previewUrl; // 优先使用缩略图作为封面
        }
        item.author = $auth.user.value.id;
        item.exhibitId = exhibit.value.id;
        item.imageUrl = uploadedImage.imageUrl;
        item.previewUrl = uploadedImage.previewUrl;
        delete item.file;
      });

    await Promise.all(uploadPromises);

    if (!exhibit.value.coverUrl && exhibit.value.items.length > 0) {
      const randomIndex = Math.floor(
        Math.random() * exhibit.value.items.length
      );
      exhibit.value.coverUrl = exhibit.value.items[randomIndex].previewUrl || exhibit.value.items[randomIndex].imageUrl;
    }

    const payload = {
      id: exhibit.value.id,
      title: exhibit.value.title,
      description: exhibit.value.description,
      privacy: exhibit.value.privacy || "public",
      author: $auth.user.value.id,
      coverUrl: exhibit.value.coverUrl,
      items: exhibit.value.items.map(
        ({ imageUrl, previewUrl, title, description, author, exhibitId }) => ({
          imageUrl,
          previewUrl,
          title,
          description,
          author,
          exhibitId,
        })
      ),
    };

    const apiUrl = exhibitId ? "/api/exhibit/update" : "/api/exhibit/create";
    const method = exhibitId ? "PUT" : "POST";

    const apiResponse = await fetch(apiUrl, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      throw new Error(
        errorData.statusMessage ||
          `Failed to ${exhibitId ? "update" : "create"} exhibit`
      );
    }

    const responseData = await apiResponse.json();
    alert(responseData.message);
    router.push(`/exhibit/${exhibitId}`);
  } catch (error) {
    console.error("保存失败:", error);
    alert(`保存失败: ${error.message}`);
  } finally {
    sending.value = false;
  }
};
</script>

<style scoped>
/* You can add custom styles here */
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
</style>