<template>
  <div v-if="isShowingForm">
    <ProductFormView
      :product-data="selectedProduct"
      :is-edit="!!selectedProduct"
      @close-form="resetForm"
    />
  </div>
  <div v-else-if="auth.isAuthenticated">
    <PageContainer title="Produk" subtitle="Daftar produk...">
      <DataTable :column-count="11">
        <template v-slot:action-2>
          <div class="flex space-x-2">
            <SearchInput v-model="table.filters.keyword"></SearchInput>
          </div>
        </template>
        <template v-slot:action-3>
          <div class="flex space-x-2">
            <CustomButton
              size="mobile"
              label="Add"
              class="bg-primary-700 hover:bg-primary-800"
              @click="isShowingForm = true"
            />
          </div>
        </template>
        <template v-slot:thead>
          <tr>
            <th>SKU</th>
            <th>Nama</th>
            <th>Tipe</th>
            <th>Kategori</th>
            <th>Stok</th>
            <th>Harga Modal</th>
            <th>Harga</th>
            <th>Harga Retail</th>
            <th>Diskon</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </template>
        <template v-slot:tbody>
          <tr v-for="(item, index) in table.items" :key="index">
            <td>{{ item.sku || "-" }}</td>
            <td>{{ item.name || "-" }}</td>
            <td>{{ item.type || "-" }}</td>
            <td>{{ (item.category && item.category.name) || "-" }}</td>
            <td>{{ item.stock || "-" }}</td>
            <td>{{ item.capitalPrice || "-" }}</td>
            <td>{{ item.sellingPrice || "-" }}</td>
            <td>{{ item.sellingRetailPrice || "-" }}</td>
            <td>{{ item.discountPrice || "-" }}</td>
            <td>{{ (item.isActive ? "Active" : "Inactive") || "-" }}</td>
            <td class="flex justify-center space-x-2">
              <CustomButton
                size="fit"
                :icon="Trash2"
                class="bg-red-700 hover:bg-red-800"
                @click="deleteProduct(item.sku)"
              />
              <CustomButton
                size="fit"
                :icon="Pencil"
                class="bg-primary-200 hover:bg-primary-300 text-primary-950"
                @click="editProduct(item)"
              />
            </td>
          </tr>
        </template>
      </DataTable>
    </PageContainer>
  </div>
  <div v-else>
    <DefaultSkeleton class="mb-2" />
    <DefaultSkeleton class="mb-2" />
    <DefaultSkeleton class="mb-2" />
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";

import DataTable from "@/components/Table/DataTable.vue";
import PageContainer from "@/views/PageContainer.vue";
import SearchInput from "@/components/Input/SearchInput.vue";
import axios from "axios";
import useTable from "@/stores/useTable";
import CustomButton from "@/components/Button/CustomButton.vue";
import ProductFormView from "@/views/product/ProductFormView.vue";
import { Trash2, Pencil } from "lucide-vue-next";
import useToast from "@/stores/useToast";
import useAuth from "@/stores/useAuth";
import DefaultSkeleton from "@/components/Skeleton/DefaultSkeleton.vue";
import { useRoute } from "vue-router";

const auth = useAuth();
const table = useTable();
const toast = useToast();
const route = useRoute();

let debounce;

const isShowingForm = ref(false);
const selectedProduct = ref(null);

onMounted(async () => {
  await auth.checkLoginSession(route);
  table.resetPage();
  await fetchProducts();
});

watch(table.filters, () => {
  table.page.current = 1;

  if (debounce) {
    clearTimeout(debounce);
  }
  debounce = setTimeout(() => fetchProducts(), 500);
});

watch(
  () => table.page.current,
  () => {
    fetchProducts();
  }
);

const fetchProducts = async () => {
  try {
    const { data } = await axios.get(
      `${process.env.VUE_APP_API_BASE_URL}/api/products?shop_id=${
        auth.shopId
      }&page=${table.page.current}${
        table.filters.keyword ? "&keyword=" + table.filters.keyword : ""
      }`,
      {
        headers: {
          Authorization: `Bearer ${auth.authToken}`,
        },
        withCredentials: true,
      }
    );

    table.items = data.data.map((item) => {
      return {
        sku: item.sku,
        name: item.name,
        capitalPrice: item.capital_price,
        sellingRetailPrice: item.selling_retail_price,
        sellingPrice: item.selling_price,
        discountPrice: item.discount_price,
        stock: item.stock,
        imageUrl: item.image_url,
        type: item.type,
        category: item.category,
        ingredients: item.ingredients,
        barcode: item.barcode,
        isActive: item.is_active,
      };
    });

    table.page.current = data.meta.current_page;
    table.page.last = data.meta.last_page;
    table.page.per = data.meta.per_page;
    table.page.total = data.meta.total;
  } catch (response) {
    auth.handleUnauthenticated(response);
  }
};

const editProduct = (item) => {
  isShowingForm.value = true;
  selectedProduct.value = {
    sku: item.sku,
    name: item.name,
    capitalPrice: item.capitalPrice,
    sellingRetailPrice: item.sellingRetailPrice,
    sellingPrice: item.sellingPrice,
    discountPrice: item.discountPrice,
    stock: item.stock,
    imageUrl: item.imageUrl,
    type: item.type,
    category: item.category,
    ingredients: item.ingredients,
    barcode: item.barcode,
    isActive: item.isActive,
  };
};

const deleteProduct = async (sku) => {
  const { data } = await axios.delete(
    `${process.env.VUE_APP_API_BASE_URL}/api/products/delete?shop_id=${auth.shopId}&sku=${sku}`,
    {
      headers: {
        Authorization: `Bearer ${auth.authToken}`,
      },
      withCredentials: true,
    }
  );

  if (data["error_type"]) {
    toast.message = "Gagal";
    toast.description = data.message;
    toast.type = "FAILED";
    toast.trigger();
  } else {
    toast.message = "Sukses";
    toast.description = data.message;
    toast.type = "SUCCESS";
    toast.trigger();
  }
};

const resetForm = () => {
  isShowingForm.value = false;
  selectedProduct.value = null;
};
</script>
