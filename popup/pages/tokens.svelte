<script lang="ts">
  import { _ } from "popup/i18n";

  import NavClose from "../components/NavClose.svelte";
  import SearchBox from "../components/SearchBox.svelte";
  import AddIcon from "../components/icons/Add.svelte";
  import Modal from "../components/Modal.svelte";
  import AddTokenModal from "../modals/AddToken.svelte";
  import Toggle from "../components/Toggle.svelte";
  import TokenImage from "../components/TokenImage.svelte";

  import tokensStore from "popup/store/tokens";

  import { TokenType, viewIcon } from "app/utils/icon-view";
  import { rmFTToken } from "app/backend/tokens";

  const SKIP = 2; // skipt 2 native tokens

  let search = "";
  let tokenAddModal = false;

  $: tokensList = $tokensStore.slice(SKIP);

  const onInputSearch = (e: CustomEvent) => {
    search = e.detail;
  };

  const handleOnToggle = (index: number) => {
    rmFTToken(index + SKIP);
  };
</script>

<Modal
  show={Boolean(tokenAddModal)}
  title={$_("tokens.modals.add.title")}
  on:close={() => (tokenAddModal = !tokenAddModal)}
>
  <div class="m-warp">
    <AddTokenModal on:close={() => (tokenAddModal = !tokenAddModal)} />
  </div>
</Modal>

<main>
  <NavClose title={$_("tokens.title")} />
  <SearchBox
    placeholder={$_("tokens.placeholder")}
    focus
    on:input={onInputSearch}
  >
    <span class="add" onmouseup={() => (tokenAddModal = !tokenAddModal)}>
      <AddIcon />
    </span>
  </SearchBox>
  <ul>
    {#if tokensList.length == 0}
      <p>
        {$_("tokens.notokens")}
      </p>
    {/if}
    {#each tokensList as token, i}
      <li>
        <TokenImage
          src={viewIcon(token.base58, TokenType.FT)}
          alt={token.symbol}
          width="36"
          height="36"
        />
        <div>
          <h3>
            {token.symbol}
          </h3>
          <b>
            {token.name}
          </b>
        </div>
        <span>
          <Toggle checked={true} on:toggle={() => handleOnToggle(i)} />
        </span>
      </li>
    {/each}
  </ul>
</main>

<style lang="scss">
  @import "../styles/mixins";
  main {
    height: 100vh;
    overflow: hidden;

    @include flex-center-top-column;

    :global(ul) {
      max-width: 500px;
    }
  }
  span.add {
    cursor: pointer;
    margin: 5px;

    &:hover {
      :global(svg > line) {
        stroke: var(--card-color);
      }
      :global(svg > rect) {
        fill: var(--primary-color);
      }
    }
  }
  ul {
    margin: 0;
    padding: 0;
    margin-block-start: 25px;
    overflow-y: scroll;

    & > li {
      min-width: 270px;

      margin: 5px;
      padding: 5px;

      padding-left: 16px;
      padding-right: 16px;

      background-color: var(--card-color);
      border: solid 1px var(--card-color);

      @include border-radius(16px);
      @include flex-between-row;

      // &.loading {
      //   @include loading-gradient(var(--background-color), var(--card-color));
      // }

      & > div {
        width: 100%;
        padding-left: 10px;

        & > * {
          @include text-shorten;
          max-width: 120px;
        }
        & > h3 {
          margin-block-end: 0.3em;
          margin-block-start: 0.3em;
        }
      }
    }
  }
</style>
