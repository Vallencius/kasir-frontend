<template>
  <div
    class="fixed z-40 top-0 left-0 h-screen bg-slate-800/50"
    :class="{
      'w-screen lg:w-0': page.navIsOpened,
      'w-0': !page.navIsOpened,
    }"
  ></div>
  <div class="fixed z-50 top-4 left-5 p-2 mt-3">
    <Menu
      class="cursor-pointer transition-all"
      :class="{
        'rotate-180': page.navIsOpened,
      }"
      size="40"
      @click="page.navIsOpened = !page.navIsOpened"
    />
  </div>
  <div
    class="shrink-0 transition-all"
    :class="{
      'lg:w-[100px]': page.navIsOpened,
      'lg:w-0': !page.navIsOpened,
    }"
  ></div>
  <div
    class="fixed transition-all z-40"
    :class="{
      'w-[100px] opacity-100': page.navIsOpened,
      'w-0 opacity-0 overflow-hidden': !page.navIsOpened,
    }"
  >
    <nav class="w-[100px] h-screen bg-primary-50 flex flex-col pt-4">
      <div class="w-20 h-20 p-2 mx-auto mt-20 relative top-0 left-0">
        <img
          src="@/assets/images/websiteinLogo.svg"
          alt="websiteinLogo.svg"
          class="object-cover"
        />
      </div>
      <div
        class="flex flex-col"
        :class="{ 'pointer-events-none': !page.navIsOpened }"
      >
        <NavigationMenu
          v-for="(menu, index) in filteredMenus"
          :key="index"
          :label="menu.label"
          :icon="menu.icon"
          :endpoint="menu.endpoint"
          :submenus="menu.submenus"
          :current="menu.current"
          @click="setCurrent(menu.label)"
        />
      </div>
      <div class="h-full flex flex-col justify-end text-red-500 mb-4">
        <NavigationMenu
          :icon="LogOut"
          :submenus="logoutSubmenus"
          isLogout
          @submenu-click="
            (label) => (label === 'Logout' ? logout() : backToShopList())
          "
        />
      </div>
    </nav>
  </div>
</template>

<script setup>
import {
  ChartPie,
  ShoppingCart,
  PackageSearch,
  ArrowRightLeft,
  Truck,
  Shuffle,
  Users,
  LogOut,
  Ham,
  Package,
  HandPlatter,
  Clock,
  Box,
  ShoppingBasket,
  List,
  Menu,
  Store,
} from "lucide-vue-next";
import NavigationMenu from "@/components/Navigation/NavigationMenu.vue";
import usePage from "@/stores/usePage";
import axios from "axios";
import router from "@/router";
import useToast from "@/stores/useToast";
import useAuth from "@/stores/useAuth";
import { ref } from "vue";

const menus = ref([
  {
    label: "Beranda",
    endpoint: "/dashboard",
    icon: ChartPie,
    current: true,
  },
  {
    label: "Pesan",
    icon: ShoppingCart,
    submenus: [
      {
        label: "Makanan",
        icon: Ham,
        endpoint: "/order",
      },
      {
        label: "Barang",
        icon: Package,
        endpoint: "/order",
      },
      {
        label: "Jasa",
        icon: HandPlatter,
        endpoint: "/order",
      },
      {
        label: "Jasa Berwaktu",
        icon: Clock,
        endpoint: "/order",
      },
    ],
    current: false,
  },
  {
    label: "Produk",
    icon: PackageSearch,
    submenus: [
      {
        label: "Kategori Produk",
        icon: Box,
        endpoint: "/category",
      },
      {
        label: "Bahan Baku Produk",
        icon: ShoppingBasket,
        endpoint: "/ingredient",
      },
      {
        label: "Daftar Produk",
        icon: List,
        endpoint: "/product",
      },
    ],
    current: false,
  },
  {
    label: "Transaksi",
    icon: ArrowRightLeft,
    endpoint: "/transaction",
    current: false,
  },
  {
    label: "Supplier",
    icon: Truck,
    endpoint: "/supplier",
    current: false,
  },
  {
    label: "Rekon",
    icon: Shuffle,
    endpoint: "/recon",
    current: false,
  },
  {
    label: "Karyawan",
    icon: Users,
    endpoint: "/subuser",
    current: false,
  },
]);

const logoutSubmenus = [
  {
    label: "Toko",
    icon: Store,
  },
  {
    label: "Logout",
    icon: LogOut,
  },
];

const rolePermissions = {
  KASIR: ["Pesan", "Transaksi"],
  PENYIMPANAN: [
    "Kategori Produk",
    "Daftar Produk",
    "Bahan Baku Produk",
    "Supplier",
  ],
  MANAGER: [
    "Beranda",
    "Pesan",
    "Produk",
    "Transaksi",
    "Supplier",
    "Rekon",
    "Karyawan",
  ],
  MASTER: null,
};

const auth = useAuth();
const page = usePage();
const toast = useToast();

const backToShopList = () => {
  auth.clearLocalStorage("shop_id");
  router.push("/shop");
};

function filterMenuByRole(menus, role) {
  const allowedLabels = rolePermissions[role] || [];

  if (role === "MASTER") {
    return menus;
  } else {
    return menus
      .map((menu) => {
        if (menu.submenus) {
          const filteredSubmenus = menu.submenus.filter((submenu) =>
            allowedLabels.includes(submenu.label)
          );
          if (filteredSubmenus.length > 0) {
            return { ...menu, submenus: filteredSubmenus };
          }
        }

        if (allowedLabels.includes(menu.label)) {
          return menu;
        }
        return null;
      })
      .filter((menu) => menu !== null);
  }
}

const filteredMenus = filterMenuByRole(menus.value, auth.permission);

const logout = async () => {
  try {
    const baseURL = process.env.VUE_APP_API_BASE_URL;
    const endpoint = `${baseURL}/api/auth/logout`;

    const { data } = await axios.post(
      endpoint,
      {},
      {
        headers: {
          Authorization: `Bearer ${auth.authToken}`,
        },
        withCredentials: true,
      }
    );

    if (!data.error_type) {
      toast.message = "Sukses";
      toast.description = "Logout berhasil!";
      toast.type = "SUCCESS";
      toast.trigger();

      await router.push("/login");
    } else {
      toast.message = "Gagal";
      toast.description = "Logout gagal!";
      toast.type = "FAILED";
      toast.trigger();
    }
  } catch (error) {
    toast.message = "Gagal";
    toast.description = error.response?.data || error.message;
    toast.type = "FAILED";
    toast.trigger();
  }

  auth.clearLocalStorage();
};

const setCurrent = (label) => {
  menus.value.map((menu) => (menu.current = false));
  menus.value.find((menu) => menu["label"] === label).current = true;
};
</script>
