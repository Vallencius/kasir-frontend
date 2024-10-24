<template>
  <PageContainer
    :title="isEdit ? 'Ubah Kategori' : 'Tambah Kategori'"
    :subtitle="
      isEdit ? 'Mengubah detail kategori...' : 'Menambah kategori baru...'
    "
    enable-back
    @back="$emit('closeForm')"
  >
    <div class="grid grid-cols-3 gap-4">
      <FormCard
        title="Informasi Kategori Produk"
        :icon="ArchiveRestore"
        class="col-span-3"
      >
        <div class="space-y-8">
          <div class="grid grid-cols-2 gap-4">
            <TextInput
              v-model="form.code"
              name="code"
              label="Kode"
              placeholder="Masukkan kode untuk kategori..."
              class="col-span-2 lg:col-span-1"
            />
            <TextInput
              v-model="form.name"
              name="name"
              label="Nama Kategori"
              placeholder="Masukkan nama kategori..."
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
import { ArchiveRestore, Plus, Pencil } from "lucide-vue-next";
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
  categoryData: {
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
  code: props.categoryData ? props.categoryData.code : "",
  name: props.categoryData ? props.categoryData.name : "",
});

const submitProduct = async () => {
  if (validateForm()) {
    let response;

    if (props.isEdit) {
      response = await axios.put(
        `${process.env.VUE_APP_API_BASE_URL}/api/categories`,
        {
          shop_id: auth.shopId,
          code: form.code,
          name: form.name,
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
        `${process.env.VUE_APP_API_BASE_URL}/api/categories`,
        {
          shop_id: auth.shopId,
          code: form.code,
          name: form.name,
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
