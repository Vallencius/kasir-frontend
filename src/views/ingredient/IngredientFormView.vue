<template>
  <PageContainer
    :title="isEdit ? 'Ubah Bahan Baku' : 'Tambah Bahan Baku'"
    :subtitle="
      isEdit ? 'Mengubah detail bahan baku...' : 'Menambah bahan baku baru...'
    "
    enable-back
    @back="$emit('closeForm')"
  >
    <div class="grid grid-cols-3 gap-4">
      <FormCard
        title="Informasi Bahan Baku"
        :icon="ShoppingBasket"
        class="col-span-3"
      >
        <div class="space-y-8">
          <div class="grid grid-cols-2 gap-4">
            <TextInput
              v-if="!isEdit"
              v-model="form.name"
              name="name"
              label="Nama Kategori"
              placeholder="Masukkan nama kategori..."
              class="col-span-2 lg:col-span-1"
            />
            <TextInput
              v-if="!isEdit"
              v-model="form.stock"
              name="stock"
              label="Stock"
              type="number"
              placeholder="Masukkan stok..."
              class="col-span-2 lg:col-span-1"
            />
            <TextInput
              v-model="form.unit_name"
              name="unit_name"
              label="Satuan Bahan Baku"
              placeholder="Masukkan satuan bahan baku..."
              class="col-span-2 lg:col-span-1"
            />
            <TextInput
              v-model="form.price"
              name="price"
              label="Harga"
              type="number"
              placeholder="Masukkan harga..."
              class="col-span-2 lg:col-span-1"
            />
          </div>
          <div class="flex justify-center pt-4">
            <CustomButton
              size="xl"
              :label="isEdit ? 'Edit' : 'Add'"
              :icon="isEdit ? Pencil : Plus"
              class="bg-primary-700 hover:bg-primary-800"
              @click="submitProduct"
            />
          </div>
        </div>
      </FormCard>
    </div>
  </PageContainer>
</template>

<script setup>
import { ShoppingBasket, Plus, Pencil } from "lucide-vue-next";
import { defineAsyncComponent, reactive } from "vue";
import PageContainer from "@/views/PageContainer.vue";
import axios from "axios";
import FormCard from "@/components/Card/FormCard.vue";
import CustomButton from "@/components/Button/CustomButton.vue";
import useToast from "@/stores/useToast";
import useAuth from "@/stores/useAuth";

const TextInput = defineAsyncComponent(() =>
  import("@/components/Input/TextInput.vue")
);

const props = defineProps({
  ingredientData: {
    type: Object,
    default: null,
  },
  isEdit: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["closeForm"]);

const auth = useAuth();
const toast = useToast();

const form = reactive({
  name: props.ingredientData ? props.ingredientData.name : "",
  stock: props.ingredientData ? props.ingredientData.stock : "",
  unit_name: props.ingredientData ? props.ingredientData.unitName : "",
  price: props.ingredientData ? props.ingredientData.price : "",
});

const submitProduct = async () => {
  if (validateForm()) {
    let response;

    if (props.isEdit) {
      response = await axios.put(
        `${process.env.VUE_APP_API_BASE_URL}/api/ingredients`,
        {
          shop_id: auth.shopId,
          unit_name: form.unit_name,
          price: form.price,
        },
        {
          headers: {
            Authorization: `Bearer ${auth.authToken}`,
          },
          withCredentials: true,
        }
      );
    } else {
      response = await axios.post(
        `${process.env.VUE_APP_API_BASE_URL}/api/ingredients`,
        {
          shop_id: auth.shopId,
          name: form.name,
          stock: form.stock,
          unit_name: form.unit_name,
          price: form.price,
        },
        {
          headers: {
            Authorization: `Bearer ${auth.authToken}`,
          },
          withCredentials: true,
        }
      );
    }

    if (response.data["error_type"]) {
      toast.message = "Gagal";
      toast.description = response.data.message;
      toast.type = "FAILED";
      toast.trigger();
    } else {
      toast.message = "Sukses";
      toast.description = response.data.message;
      toast.type = "SUCCESS";
      toast.trigger();

      emit("closeForm");
    }
  }
};

const validateForm = () => {
  let isValid = true;

  Object.keys(form).forEach((field) => {
    if (!form[field]) {
      toast.message = "Gagal";
      toast.description = `Kolom ${field} harus diisi!`;
      toast.type = "FAILED";
      toast.trigger();

      isValid = false;
    }
  });

  return isValid;
};
</script>
